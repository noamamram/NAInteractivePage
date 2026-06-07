import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";

export const AVATAR_MODEL_URL = "/models/avatar.glb";
export const AVATAR_ANIMATION_NAME = "mixamo.com";

const AVATAR_TARGET_HEIGHT = 1.55;
const AVATAR_FLOOR_LIFT = 0.06;

/** Mirror on X at rot=0: face camera (+Z) and point toward the links column. */
export function applyAvatarFacing(rig, pointToward = "right") {
    const uniform = Math.abs(rig.scale.y) || Math.abs(rig.scale.x) || 1;
    const mirrorX = pointToward === "right" ? -1 : 1;
    rig.scale.set(uniform * mirrorX, uniform, uniform);
    rig.rotation.y = 0;
    rig.updateMatrixWorld(true);
    rig.traverse((child) => {
        if (!child.isMesh && !child.isSkinnedMesh) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
            if (!mat) return;
            mat.side = mirrorX < 0 ? THREE.DoubleSide : THREE.FrontSide;
            mat.needsUpdate = true;
        });
    });
}

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);

let avatarLoadPromise = null;
let cachedRig = null;
let cachedMixer = null;
let cachedAction = null;

function computeObjectBounds(object) {
    const box = new THREE.Box3();
    let hasMesh = false;
    object.traverse((child) => {
        if (!child.isMesh && !child.isSkinnedMesh) return;
        child.updateWorldMatrix(true, false);
        const meshBox = new THREE.Box3().setFromObject(child);
        if (!hasMesh) {
            box.copy(meshBox);
            hasMesh = true;
        } else {
            box.union(meshBox);
        }
    });
    return hasMesh ? box : new THREE.Box3().setFromObject(object);
}

function prepareAvatarMaterials(scene) {
    scene.traverse((child) => {
        if (!child.isMesh && !child.isSkinnedMesh) return;
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = false;
        if (!child.material) return;
        const mats = Array.isArray(child.material) ? child.material : [child.material];
        mats.forEach((mat) => {
            if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
            if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
            if (mat.isMeshStandardMaterial || mat.isMeshPhongMaterial) {
                mat.roughness = Math.min(Math.max(mat.roughness ?? 0.5, 0.72), 0.88);
                mat.metalness = 0;
                if (mat.color) {
                    const hsl = { h: 0, s: 0, l: 0 };
                    mat.color.getHSL(hsl);
                    if (hsl.l < 0.12) mat.color.offsetHSL(0, 0, 0.08);
                }
            }
            mat.needsUpdate = true;
        });
    });
}

function normalizeAvatarRig(rig, scene, pointToward = "right") {
    scene.updateMatrixWorld(true);
    const box = computeObjectBounds(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    scene.position.sub(center);
    scene.updateMatrixWorld(true);

    const grounded = computeObjectBounds(scene);
    scene.position.y -= grounded.min.y;

    const height = Math.max(size.y, 0.001);
    rig.scale.setScalar(AVATAR_TARGET_HEIGHT / height);
    scene.position.y += AVATAR_FLOOR_LIFT;
    applyAvatarFacing(rig, pointToward);
}

function advanceMixerToPose(mixer, clip) {
    if (!mixer || !clip) return;
    const step = 1 / 60;
    const duration = Math.max(clip.duration || 0, step);
    for (let elapsed = 0; elapsed <= duration; elapsed += step) {
        mixer.update(step);
    }
}

function pickAvatarClip(animations) {
    if (!animations?.length) return null;
    return (
        animations.find((anim) => anim.name.includes(AVATAR_ANIMATION_NAME)) ||
        animations.find((anim) => anim.duration > 0.5 && anim.tracks.length > 10) ||
        null
    );
}

function loadAvatarGltf(url = AVATAR_MODEL_URL) {
    if (!avatarLoadPromise) {
        avatarLoadPromise = loader.loadAsync(url);
    }
    return avatarLoadPromise;
}

export async function warmAvatarModel(onProgress) {
    onProgress?.(0.1, "AVATAR · DOWNLOAD");
    await loadAvatarGltf();
    onProgress?.(0.85, "AVATAR · RIG");
}

export async function loadAvatarModel(pointToward = "right") {
    if (cachedRig) {
        applyAvatarFacing(cachedRig, pointToward);
        return { model: cachedRig, mixer: cachedMixer, action: cachedAction };
    }

    const gltf = await loadAvatarGltf();
    const scene = gltf.scene;
    prepareAvatarMaterials(scene);

    const rig = new THREE.Group();
    rig.add(scene);

    const mixer = new THREE.AnimationMixer(scene);
    const clip = pickAvatarClip(gltf.animations);
    if (clip) {
        const poseAction = mixer.clipAction(clip);
        poseAction.setLoop(THREE.LoopOnce);
        poseAction.clampWhenFinished = true;
        poseAction.play();
        advanceMixerToPose(mixer, clip);
        poseAction.stop();
    }

    normalizeAvatarRig(rig, scene, pointToward);

    let action = null;
    if (clip) {
        action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();
    }

    cachedRig = rig;
    cachedMixer = mixer;
    cachedAction = action;

    return { model: rig, mixer, action };
}

export function replayAvatarAction(action) {
    if (!action) return;
    action.reset();
    action.setLoop(THREE.LoopOnce);
    action.clampWhenFinished = true;
    action.play();
}
