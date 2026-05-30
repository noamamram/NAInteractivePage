import Portfolio from './portfolio'
import { LanguageProvider } from './i18n/LanguageProvider'

function App() {
    return (
        <LanguageProvider>
            <Portfolio />
        </LanguageProvider>
    )
}

export default App