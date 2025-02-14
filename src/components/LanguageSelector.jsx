import { useState, useEffect } from "react";

const GoogleTranslate = () => {
    const [showTranslate, setShowTranslate] = useState(false);

    useEffect(() => {
        if (showTranslate) {
            const addScript = () => {
                if (!document.querySelector("#google-translate-script")) {
                    const script = document.createElement("script");
                    script.id = "google-translate-script";
                    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
                    document.body.appendChild(script);
                }
            };

            window.googleTranslateElementInit = () => {
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        includedLanguages: "fr,de,es,zh,hi,ar,ja,ru,pt,ko",
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                    },
                    "google_translate_element"
                );
            };

            addScript();
        }
    }, [showTranslate]); // Runs only when `showTranslate` state changes

    return (
        <div className="text-center">
            <button
                onClick={() => setShowTranslate(!showTranslate)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-700 transition"
            >
                {showTranslate ? "Hide Translator" : "Translate Website"}
            </button>

            {showTranslate && (
                <div id="google_translate_element" className="mt-4 border p-2 inline-block rounded-lg shadow-md bg-white"></div>
            )}
        </div>
    );
};

export default GoogleTranslate;
