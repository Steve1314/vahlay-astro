import { div } from "framer-motion/client";
import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
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
                        layout: window.google.translate.TranslateElement.InlineLayout.HORIZONTAL, // Change this to SIMPLE, HORIZONTAL, or VERTICAL
                    },
                    "google_translate_element"
                );
            };

            addScript();
        }
    }, [showTranslate]); // Runs only when `showTranslate` state changes

    return (
        <div className="flex flex-row  text-center ">
           

           
             <div>
             <button
                onClick={() => setShowTranslate(!showTranslate)}
                className="p-2 mt-1 bg-red-700 text-white rounded-lg hover:bg-red-900 transition"
            >
                {showTranslate ? <IoMdClose/> : "Translate"}
            </button>
             </div>
            {showTranslate && (
               
                    <div id="google_translate_element" > </div>
                
            )}
        </div>
    );
};

export default GoogleTranslate;
