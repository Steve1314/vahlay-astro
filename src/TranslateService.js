import axios from "axios";

const API_URL = "https://libretranslate.com/translate"; // Public LibreTranslate API

const translateText = async (text, targetLang) => {
    try {
        const response = await axios.post(
            API_URL,
            {
                q: text,
                source: "en", // Source language (change if needed)
                target: targetLang,
                format: "text",
            },
            {
                headers: { "Content-Type": "application/json" },
            }
        );

        return response.data.translatedText;
    } catch (error) {
        console.error("Translation Error:", error);
        return text; // Return original text if translation fails
    }
};

export default translateText;
