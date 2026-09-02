/* =========================================================
   NEXA AI VOICE — FIRST VERSION
   Microphone + Speech Recognition + Voice Response
========================================================= */

(function () {

    "use strict";


    let recognition = null;

    let isListening = false;

    let voiceEnabled = false;


    /* =====================================================
       SPEECH SYNTHESIS
    ===================================================== */

    function speak(text) {

        if (!voiceEnabled || !text) {
            return;
        }

        if (!("speechSynthesis" in window)) {
            return;
        }

        window.speechSynthesis.cancel();

        const speech =
            new SpeechSynthesisUtterance(text);

        speech.rate = 1;
        speech.pitch = 1;
        speech.volume = 1;

        window.speechSynthesis.speak(
            speech
        );
    }


    /* =====================================================
       NEXA RESPONSE
    ===================================================== */

    function generateResponse(text) {

        const message =
            text.trim().toLowerCase();

        if (!message) {
            return "I didn't hear anything.";
        }


        if (
            message.includes("hello") ||
            message.includes("hi")
        ) {
            return "Hey! I'm NEXA. It's good to hear from you.";
        }


        if (
            message.includes("how are you")
        ) {
            return "I'm doing great. I'm right here with you.";
        }


        if (
            message.includes("who are you")
        ) {
            return "I'm NEXA, your personal voice assistant.";
        }


        if (
            message.includes("thank you") ||
            message.includes("thanks")
        ) {
            return "You're welcome.";
        }


        if (
            message.includes("bye")
        ) {
            return "See you later.";
        }


        return `You said ${text}. I'm listening.`;
    }


    /* =====================================================
       MICROPHONE
    ===================================================== */

    function createRecognition() {

        const SpeechRecognition =
            window.SpeechRecognition ||
            window.webkitSpeechRecognition;


        if (!SpeechRecognition) {

            console.warn(
                "NEXA Voice: Speech Recognition is not supported."
            );

            return null;
        }


        const instance =
            new SpeechRecognition();


        instance.continuous = false;

        instance.interimResults = false;

        instance.lang = "en-US";


        instance.onstart = () => {

            isListening = true;

            updateVoiceUI(
                true
            );
        };


        instance.onend = () => {

            isListening = false;

            updateVoiceUI(
                false
            );
        };


        instance.onerror = event => {

            console.error(
                "NEXA Voice error:",
                event.error
            );

            isListening = false;

            updateVoiceUI(
                false
            );
        };


        instance.onresult = event => {

            const transcript =
                event
                    .results[0][0]
                    .transcript;


            console.log(
                "NEXA heard:",
                transcript
            );


            const response =
                generateResponse(
                    transcript
                );


            console.log(
                "NEXA response:",
                response
            );


            speak(
                response
            );
        };


        return instance;
    }


    /* =====================================================
       UI
    ===================================================== */

    function updateVoiceUI(
        listening
    ) {

        const buttons =
            document.querySelectorAll(
                ".nexa-voice-toggle"
            );


        buttons.forEach(
            button => {

                button.classList.toggle(
                    "active",
                    voiceEnabled
                );

                button.classList.toggle(
                    "listening",
                    listening
                );

            }
        );
    }


    /* =====================================================
       TOGGLE
    ===================================================== */

    function toggleVoice() {

        voiceEnabled =
            !voiceEnabled;


        if (!voiceEnabled) {

            if (recognition) {

                try {
                    recognition.stop();
                } catch (_) {}

            }

            window.speechSynthesis?.cancel();

            updateVoiceUI(
                false
            );

            return;
        }


        if (!recognition) {

            recognition =
                createRecognition();
        }


        if (!recognition) {

            voiceEnabled =
                false;

            alert(
                "NEXA Voice is not supported in this browser."
            );

            return;
        }


        updateVoiceUI(
            false
        );


        try {

            recognition.start();

        } catch (error) {

            console.error(
                "NEXA Voice start error:",
                error
            );

        }
    }


    /* =====================================================
       CONNECT NEXA LOGO
    ===================================================== */

    function setupVoiceButtons() {

        const selectors = [

            ".nexa-logo",

            ".logo",

            ".mobile-logo"

        ];


        const buttons =
            document.querySelectorAll(
                selectors.join(",")
            );


        buttons.forEach(
            button => {

                button.classList.add(
                    "nexa-voice-toggle"
                );


                button.addEventListener(
                    "click",
                    event => {

                        /*
                         * Normal navigation should
                         * continue when Voice is off.
                         *
                         * For now, hold SHIFT while
                         * clicking NEXA to activate Voice.
                         */

                        if (
                            event.shiftKey
                        ) {

                            event.preventDefault();

                            toggleVoice();
                        }

                    }
                );
            }
        );
    }


    /* =====================================================
       PUBLIC API
    ===================================================== */

    window.NEXAVoice = {

        enable() {

            if (!voiceEnabled) {
                toggleVoice();
            }

        },

        disable() {

            if (voiceEnabled) {
                toggleVoice();
            }

        },

        toggle:
            toggleVoice,

        speak:
            speak,

        isEnabled() {

            return voiceEnabled;
        }

    };


    /* =====================================================
       START
    ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            setupVoiceButtons
        );

    } else {

        setupVoiceButtons();
    }


})();