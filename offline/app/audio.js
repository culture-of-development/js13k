let audioCtx;
const sfx = {};

const playAudioBuffer = function(buffer) {
    // https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer
    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    var source = audioCtx.createBufferSource();

    // set the buffer in the AudioBufferSourceNode
    source.buffer = buffer;

    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);

    // start the source playing
    source.start();
};

const playSfx = function(sfx_name) {
    if (!sfx.hasOwnProperty(sfx_name)) {
        console.log("trying to play unloaded sfx: " + sfx_name);
        return;
    }
    playAudioBuffer(sfx[sfx_name]);
}


const audioBody = document.querySelector("body");

let init_audio = function() {
    audioBody.removeEventListener("keypress", init_audio);
    console.log("initializing audio");
    
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function loadAudio(sfx_name) {
        // https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData
        var request = new XMLHttpRequest();
        request.open('GET', sfx_name + '.m4a', true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            var audioData = request.response;
            audioCtx.decodeAudioData(audioData, function(buffer) {
                sfx[sfx_name] = buffer;
            },
            function(e){ console.log("Error with decoding audio data: " + e.err); });
        }
        request.send();
    }

    loadAudio("keys");
    loadAudio("flashlight");
    loadAudio("data");
    loadAudio("win");
};

audioBody.addEventListener("keypress", init_audio);
