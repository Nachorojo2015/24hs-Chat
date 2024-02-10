import { useEffect, useRef, useState } from "react"
import Swal from "sweetalert2";
import { io } from "socket.io-client";
import EmojiPicker from "@emoji-mart/react";
import data from "@emoji-mart/data"

const Chat = () => {

  const [user, setUser] = useState({});
  const [isPickerVisible, setPickerVisible] = useState(false)
  const [quantityUsers, setQuantityUsers] = useState(0)

  //login user
  useEffect(() => {
    const fetchData = async () => {
      try {
        const login = await Swal.fire({
          title: "Submit your Github username",
          input: "text",
          inputAttributes: {
            autocapitalize: "off",
          },
          showCancelButton: true,
          confirmButtonText: "Look up",
          showLoaderOnConfirm: true,
          preConfirm: async (login) => {
            try {
              const githubUrl = `https://api.github.com/users/${login}`;
              const response = await fetch(githubUrl);

              if (!response.ok) {
                Swal.showValidationMessage(`${JSON.stringify(await response.json())}`);
              }

              return response.json();
            } catch (error) {
              Swal.showValidationMessage(`Request failed: ${error}`);
            }
          },
          allowOutsideClick: () => !Swal.isLoading(),
        });
        if (login.isConfirmed) {
          setUser({
            'username': login.value.login,
            'user-image': login.value.avatar_url
          })
          const socket = io("http://localhost:3000/", { withCredentials: true })
          socket.emit("new-user",login.value.login)
          socket.on("users",(lengthUsers)=>{
            setQuantityUsers(lengthUsers)
          })
          const containerMessages = document.getElementById("container-messages")
          socket.on("all-messages", (data) => {
            containerMessages.innerHTML = ''
            data.forEach(u => {
              if (u["username"] !== login.value.login) {
                if (u["message"][1] === 'a') {
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  containerMessages.innerHTML += `
                  <div class="flex items-center gap- mt-2">
                    <img src=${u["user-image"]} alt="" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                    <audio src=${u["message"][0]} controls class="mt-2 ml-2"></audio>
                  </div>
                  <p class="ml-16 mt-2">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                  `
                } else if (u["message"][1] === 'i') {
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  containerMessages.innerHTML += `
                      <div class="flex items-center gap-3 mt-2">
                        <img src=${u["user-image"]} alt="" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                        <img src=${u["message"][0]} alt="capture-picture-user" class="w-[70%] h-[70%] md:w-[30%] md:h-[30%]" />
                      </div>
                      <p class="ml-16 mt-2">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                      `
                } else if (u["message"][1] === 'p') {
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  containerMessages.innerHTML += `
                      <div class="flex items-center gap-3">
                        <img src=${u["user-image"]} alt="" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                        <p class="bg-orange-500 rounded-3xl p-2">${u["message"][0]}</p>
                      </div>
                      <p class="ml-16 mt-1">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                      `
                } else if (u["message"][1] === 'v') {
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  containerMessages.innerHTML += `
                      <div class="flex flex-wrap items-center gap-3 mt-2">
                        <img src=${u["user-image"]} alt="" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                        <video src=${u["message"][0]} width="640" height="480" controls autoplay></video>
                      </div>
                      <p class="ml-16 mt-2">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                      `
                } else if (u["message"][1] === 'doc') {
                  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                  containerMessages.innerHTML += `
                      <div class="flex flex-wrap items-center gap-3 mt-2">
                        <img src=${u["user-image"]} alt="user-image" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                        <a href=${u["message"][0]} target="_BLANK" class="bg-red-500 p-2 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-script inline mr-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 20h-11a3 3 0 0 1 0 -6h11a3 3 0 0 0 0 6h1a3 3 0 0 0 3 -3v-11a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8" /></svg>${u["message"][0].split('/').slice(-1)[0]}</a>
                      </div>
                      <p class="ml-16 mt-2">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                      `
                } else if (u["message"][1] === 'med') {
                  const fileExtension = u["message"][0].split('/').slice(-1)[0].split('.')[1]
                  if ("webm mp4 avi mkv flv mov divx h.264 xvid rm".includes(fileExtension)) {
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    containerMessages.innerHTML += `
                      <div class="flex flex-wrap items-center gap-3 mt-2">
                        <img src=${u["user-image"]} alt="" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                        <video src=${u["message"][0]} width="640" height="480" controls autoplay></video>
                      </div>
                      <p class="ml-16 mt-2">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                      `
                  } else {
                    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    containerMessages.innerHTML += `
                      <div class="flex items-center gap-3 mt-2">
                        <img src=${u["user-image"]} alt="user-image" class="align-middle w-[50px] h-[50px] border inline rounded-[50%]"/>
                        <img src=${u["message"][0]} alt="capture-picture-user" class="w-[70%] h-[70%] md:w-[30%] md:h-[30%]" />
                      </div>
                      <p class="ml-16 mt-2">${days[new Date().getDay()] !== u["time"].split(',')[1].trim() ? "last " : ""}${u["time"]}</p>
                      `
                  }
                }
              } else {
                if (u["message"][1] === 'a') {
                  containerMessages.innerHTML += `
                  <div class="flex items-center gap-3">
                    <audio src=${u["message"][0]} controls class="mt-2 ml-auto"></audio>
                  </div>
                  `
                } else if (u["message"][1] === 'p') {
                  containerMessages.innerHTML += `
                  <div class="flex">
                    <p class="mt-3 inline-block p-2 bg-orange-500 ml-auto rounded-3xl">${u["message"][0]}</p>
                  </div>
                  `
                } else if (u["message"][1] === 'i') {
                  containerMessages.innerHTML += `
                  <div class="flex mt-2">
                  <img src=${u["message"][0]} alt="picture-sended-user" class="w-[70%] h-[70%] md:w-[30%] md:h-[30%] ml-auto"/>
                  </div>
                  `
                } else if (u["message"][1] === 'v') {
                  containerMessages.innerHTML += `
                  <div class="flex mt-2">
                  <video src=${u["message"][0]} width="640" height="480" controls autoplay class="ml-auto"></video>
                  </div>
                  `
                } else if (u["message"][1] === 'doc') {
                  containerMessages.innerHTML += `
                  <div class="flex mt-2">
                  <a href=${u["message"][0]} target="_BLANK" class="ml-auto bg-red-500 p-2 rounded-md"><svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-script inline mr-2" width="24" height="24" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M17 20h-11a3 3 0 0 1 0 -6h11a3 3 0 0 0 0 6h1a3 3 0 0 0 3 -3v-11a2 2 0 0 0 -2 -2h-10a2 2 0 0 0 -2 2v8" /></svg>${u["message"][0].split('/').slice(-1)[0]}</a>
                  </div>
                  `
                } else if (u["message"][1] === 'med') {
                  const fileExtension = u["message"][0].split('/').slice(-1)[0].split('.')[1]
                  if ("webm mp4 avi mkv flv mov divx h.264 xvid rm".includes(fileExtension)) {
                    containerMessages.innerHTML += `
                    <div class="flex mt-2">
                    <video src=${u["message"][0]} width="640" height="480" controls autoplay class="ml-auto"></video>
                    </div>
                  `
                  } else {
                    containerMessages.innerHTML += `
                    <div class="flex mt-2">
                    <img src=${u["message"][0]} alt="picture-sended-user" class="w-[70%] h-[70%] md:w-[30%] md:h-[30%] ml-auto"/>
                    </div>
                  `
                  }
                }
              }
            })
          })
          const inputSendMessage = document.getElementById("send-message")
          const buttonSendMessage = document.getElementById("send-message-button")
          buttonSendMessage.addEventListener("click", () => {
            const messageValue = inputSendMessage.value
            if (messageValue.length) {
              socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [messageValue, 'p'], "time": formatTime() })
              inputSendMessage.value = ''
            }
          })
          inputSendMessage.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
              const messageValue = inputSendMessage.value
              if (messageValue.length) {
                socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [messageValue, 'p'], "time": formatTime() })
                inputSendMessage.value = ''
              }
            }
          })
          const microButton = document.getElementById("send-voice-message");
          const sendVoiceMessage = document.getElementById("stop-voice-message")
          let mediaRecorder;
          let audioChunks = [];
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                  audioChunks.push(e.data);
                }
              };

              mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const randomNumber = Math.round(Math.random() * 1000000000);
                const audioFile = new File([audioBlob], `${randomNumber}.mp3`, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioFile);
                const inputAudio = document.createElement('input');
                inputAudio.type = 'file';
                inputAudio.accept = 'audio/*';
                const audioFiles = new DataTransfer();
                audioFiles.items.add(audioFile);
                inputAudio.files = audioFiles.files;
                const files = Object.values(inputAudio.files)
                files.forEach(async (f) => {
                  const formData = new FormData();
                  formData.append('audio', f);
                  try {
                    const response = await fetch('http://localhost:3000/audio', {
                      method: 'POST',
                      body: formData,
                    });

                    if (response.ok) {
                      // Aquí puedes manejar la respuesta del servidor dentro de la misma página
                      const responseData = await response.json();
                      console.log(responseData);

                      // Puedes mostrar un mensaje en la consola o realizar otras acciones en tu página
                      console.log('Archivo cargado exitosamente');
                      socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [`http://localhost:3000/uploads/audio/${f.name}`, 'a'], "time": formatTime() })
                    } else {
                      console.error('Error al cargar el archivo');
                    }
                  } catch (error) {
                    console.error('Error de red:', error);
                  }
                })
                audioChunks = [];
              };

              microButton.addEventListener("click", () => {
                try {
                  mediaRecorder.start();
                  console.log("Grabando...")
                  microButton.classList.add('hidden');
                  sendVoiceMessage.classList.remove("hidden")
                } catch (error) {
                  console.error('Error starting media recorder:', error);
                }
              });

              sendVoiceMessage.addEventListener("click", () => {
                try {
                  mediaRecorder.stop()
                  console.log("Grabación finalizada")
                  microButton.classList.remove("hidden")
                  sendVoiceMessage.classList.add("hidden")
                } catch (error) {
                  console.error('Error starting media recorder:', error);
                }
              })
            })
            .catch((error) => {
              console.error('Error accessing microphone:', error);
            });

          const cameraButton = document.getElementById("photo")
          cameraButton.addEventListener("click", () => {
            document.getElementById("camera-tools").classList.remove("hidden")
            document.getElementById("camera-tools").classList.add("flex")
            document.getElementById("files").classList.add("hidden")
            const video = document.getElementById('camera');
            if (video.classList.contains("hidden")) video.classList.remove("hidden")
            const cancelCameraButton = document.getElementById("cancel-camera")
            const cameraTools = document.getElementById("camera-tools")
            const capturePictureButton = document.getElementById("capture-picture")
            const startRecordingButton = document.getElementById("start-recording")
            const stopRecordingButton = document.getElementById("stop-recording")
            const sendPictureButton = document.getElementById("send-picture")
            const cancelPictureButton = document.getElementById("cancel-picture")
            const photoCanvas = document.getElementById('photoCanvas');
            const photoContext = photoCanvas.getContext('2d');
            const picturePreview = document.getElementById("picture-preview")
            const capturedPicture = document.getElementById("captured-picture")
            const videoPreview = document.getElementById("video-preview")
            const capturedVideo = document.getElementById("captured-video")
            const sendVideoButton = document.getElementById("send-video")
            const cancelVideoButton = document.getElementById("cancel-video")
            let mediaRecorder;
            let recordedChunks = [];
            let mediaStream;
            navigator.mediaDevices.getUserMedia({ video: true })
              .then((stream) => {
                mediaStream = stream
                video.srcObject = stream;
                mediaRecorder = new MediaRecorder(stream);

                mediaRecorder.ondataavailable = (event) => {
                  if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                  }
                };

                mediaRecorder.onstop = () => {
                  const blob = new Blob(recordedChunks, { type: 'video/webm' });
                  recordedChunks = [];
                  const videoUrl = URL.createObjectURL(blob);
                  capturedVideo.src = videoUrl
                  videoPreview.classList.remove("hidden")
                  video.classList.add("hidden")
                  cameraTools.classList.add("hidden")
                  stopCamera()
                };

                capturePictureButton.addEventListener('click', capturePhoto);
                startRecordingButton.addEventListener('click', startRecording);
                stopRecordingButton.addEventListener('click', stopRecording);
                cancelPictureButton.addEventListener('click', cancelCapture);
                sendPictureButton.addEventListener('click', sendPhoto);
                cancelVideoButton.addEventListener('click', cancelVideo)
                sendVideoButton.addEventListener('click', sendVideo)
                cancelCameraButton.addEventListener('click', cancelCamera)
              })
              .catch((error) => {
                console.error('Error accessing camera:', error);
              });

            function capturePhoto() {
              photoContext.drawImage(video, 0, 0, photoCanvas.width, photoCanvas.height);
              const photoUrl = photoCanvas.toDataURL('image/png');
              capturedPicture.src = photoUrl;
              picturePreview.classList.remove("hidden")
              video.classList.add("hidden")
              cameraTools.classList.add("hidden")
              stopCamera()
            }

            function startRecording() {
              console.log("Recording...")
              recordedChunks = [];
              mediaRecorder.start();
              startRecordingButton.disabled = true;
              stopRecordingButton.disabled = false;
            }

            function stopRecording() {
              console.log("Finish record")
              mediaRecorder.stop();
              startRecordingButton.disabled = false;
              stopRecordingButton.disabled = true;
            }

            function cancelCapture() {
              cameraTools.classList.add("hidden")
              picturePreview.classList.add("hidden")
            }

            function sendPhoto() {
              picturePreview.classList.add("hidden")
              cameraTools.classList.add("hidden")
              const imgSrc = capturedPicture.src;
              if (imgSrc.startsWith("data")) {
                socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [imgSrc, 'i'], "time": formatTime() })
              }
              capturedPicture.src = ''
            }

            function cancelVideo() {
              cameraTools.classList.add("hidden")
              videoPreview.classList.add("hidden")
            }

            function sendVideo() {
              videoPreview.classList.add("hidden")
              cameraTools.classList.add("hidden")
              const videoUrl = capturedVideo.src

              // Crear un nuevo elemento de entrada de video
              const inputVideo = document.createElement("input");
              inputVideo.type = "file";
              inputVideo.accept = "video/*"; // Puedes ajustar el tipo de archivo según tus necesidades

              // Convertir la URL del video a Blob
              fetch(videoUrl)
                .then(response => response.blob())
                .then(blob => {
                  const randomNumber = Math.round(Math.random() * 1000000000)
                  // Crear un objeto de datos para el video
                  const videoFile = new File([blob], `${randomNumber}.mp4`, { type: "video/mp4" });

                  // Asignar el archivo al campo de entrada de video
                  const videoFiles = new DataTransfer();
                  videoFiles.items.add(videoFile);
                  inputVideo.files = videoFiles.files;

                  const files = Object.values(inputVideo.files)
                  files.forEach(async (f) => {
                    const formData = new FormData();
                    formData.append('media', f);
                    try {
                      const response = await fetch('http://localhost:3000/images-videos', {
                        method: 'POST',
                        body: formData,
                      });

                      if (response.ok) {
                        // Aquí puedes manejar la respuesta del servidor dentro de la misma página
                        const responseData = await response.json();
                        console.log(responseData);

                        // Puedes mostrar un mensaje en la consola o realizar otras acciones en tu página
                        console.log('Archivo cargado exitosamente');
                        socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [`http://localhost:3000/uploads/media/${f.name}`, 'med'], "time": formatTime() })
                      } else {
                        console.error('Error al cargar el archivo');
                      }
                    } catch (error) {
                      console.error('Error de red:', error);
                    }
                  })
                })
                .catch(error => {
                  console.error("Error al convertir el video a Blob:", error);
                });
            }

            function cancelCamera() {
              video.classList.add("hidden")
              cameraTools.classList.add("hidden")
            }

            function stopCamera() {
              if (mediaStream) {
                const tracks = mediaStream.getTracks();

                tracks.forEach((track) => {
                  track.stop(); // Detiene cada pista de la cámara
                });
              }
            }
          })

          const fileDocumentInput = document.getElementById("document")
          const fileImageVideosInput = document.getElementById("media")
          const fileAudioInput = document.getElementById("audio")
          const sendFilesDocumentButton = document.getElementById("send-files-document")
          const sendImageVideosButton = document.getElementById("send-images-videos")
          const sendAudioButton = document.getElementById("send-audio-file")

          fileDocumentInput.addEventListener("change", (event) => {
            const files = event.target.files
            if (files.length > 0) {
              sendFilesDocumentButton.classList.remove("hidden")
            }
          })

          fileImageVideosInput.addEventListener("change", (event) => {
            const files = event.target.files
            if (files.length > 0) {
              sendImageVideosButton.classList.remove("hidden")
            }
          })

          fileAudioInput.addEventListener("change", (event) => {
            const files = event.target.files
            if (files.length > 0) {
              sendAudioButton.classList.remove("hidden")
            }
          })

          sendFilesDocumentButton.addEventListener("click", async () => {
            const files = Object.values(fileDocumentInput.files)
            files.forEach(async (f) => {
              const formData = new FormData();
              formData.append('document', f);
              try {
                const response = await fetch('http://localhost:3000/files', {
                  method: 'POST',
                  body: formData,
                });

                if (response.ok) {
                  // Aquí puedes manejar la respuesta del servidor dentro de la misma página
                  const responseData = await response.json();
                  console.log(responseData);

                  // Puedes mostrar un mensaje en la consola o realizar otras acciones en tu página
                  console.log('Archivo cargado exitosamente');
                  socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [`http://localhost:3000/uploads/documents/${f.name}`, 'doc'], "time": formatTime() })
                } else {
                  console.error('Error al cargar el archivo');
                }
              } catch (error) {
                console.error('Error de red:', error);
              }
            })
            sendFilesDocumentButton.classList.add("hidden")
          })

          sendImageVideosButton.addEventListener("click", async () => {
            const files = Object.values(fileImageVideosInput.files)
            files.forEach(async (f) => {
              const formData = new FormData();
              formData.append('media', f);
              try {
                const response = await fetch('http://localhost:3000/images-videos', {
                  method: 'POST',
                  body: formData,
                });

                if (response.ok) {
                  // Aquí puedes manejar la respuesta del servidor dentro de la misma página
                  const responseData = await response.json();
                  console.log(responseData);

                  // Puedes mostrar un mensaje en la consola o realizar otras acciones en tu página
                  console.log('Archivo cargado exitosamente');
                  socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [`http://localhost:3000/uploads/media/${f.name}`, 'med'], "time": formatTime() })
                } else {
                  console.error('Error al cargar el archivo');
                }
              } catch (error) {
                console.error('Error de red:', error);
              }
            })
            sendImageVideosButton.classList.add("hidden")
          })

          sendAudioButton.addEventListener("click", () => {
            const files = Object.values(fileAudioInput.files)
            files.forEach(async (f) => {
              const formData = new FormData();
              formData.append('audio', f);
              try {
                const response = await fetch('http://localhost:3000/audio', {
                  method: 'POST',
                  body: formData,
                });

                if (response.ok) {
                  // Aquí puedes manejar la respuesta del servidor dentro de la misma página
                  const responseData = await response.json();
                  console.log(responseData);

                  // Puedes mostrar un mensaje en la consola o realizar otras acciones en tu página
                  console.log('Archivo cargado exitosamente');
                  socket.emit("new-message", { "username": login.value.login, "user-image": login.value.avatar_url, message: [`http://localhost:3000/uploads/audio/${f.name}`, 'a'], "time": formatTime() })
                } else {
                  console.error('Error al cargar el archivo');
                }
              } catch (error) {
                console.error('Error de red:', error);
              }
            })
            sendAudioButton.classList.add("hidden")
          })
        }
      } catch (error) {
        console.log(error)
      }
    };

    fetchData();
  }, [])

  // functions
  function handleInputMessage(e) {
    if (e.target.value.length > 0) {
      document.getElementById('send-message-button').classList.remove("hidden")
      document.getElementById('send-voice-message').classList.add("hidden")
    } else {
      document.getElementById('send-message-button').classList.add("hidden")
      document.getElementById('send-voice-message').classList.remove("hidden")
    }
  }

  function formatTime() {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDate = new Date();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    const period = hours < 12 ? 'AM' : 'PM';
    const formattedTime = `${formattedHours}:${formattedMinutes} ${period}, ${days[currentDate.getDay()]}`;
    return formattedTime;
  }

  function addEmojiInput(emoji) {
    document.getElementById("send-message").value += emoji
  }

  function openFilesSection() {
    if (document.getElementById("files").classList.contains("hidden")) {
      document.getElementById("files").classList.remove("hidden")
    } else {
      document.getElementById("files").classList.add("hidden")
    }
    if (isPickerVisible) setPickerVisible(false);
  }

  function emoji() {
    if (!document.getElementById("files").classList.contains("hidden")) {
      document.getElementById("files").classList.add("hidden")
    }
    setPickerVisible(!isPickerVisible)
  }

  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleImageClick = () => {
    imageInputRef.current.click()
  }

  const handleAudioClick = () => {
    audioInputRef.current.click()
  }


  const handleFileChange = (event) => {
    const selectedFile = event.target.files;
  };

  const handleImageChange = (event) => {
    const selectedFile = event.target.files;
  }

  const handleAudioChange = (event) => {
    const selectedFile = event.target.files
  }

  return (
    <>
      <section className="relative">
        <nav className="flex items-center justify-between bg-[rgb(35,34,34)] p-3">
          <div className="flex gap-5 items-center">
            <img src={user["user-image"]} alt="user-image" className="align-middle w-[50px] h-[50px] rounded-[50%]" />
            <p>{user["username"]?.toUpperCase()}</p>
          </div>
          <div>
            <p>Users Conected: {quantityUsers}</p>
          </div>
          <div className="items-center gap-5 hidden" id="camera-tools">
            <button id="capture-picture"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-capture" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /></svg></button>
            <button id="start-recording"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-record" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /></svg></button>
            <button id="stop-recording"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-player-record-filled" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M8 5.072a8 8 0 1 1 -3.995 7.213l-.005 -.285l.005 -.285a8 8 0 0 1 3.995 -6.643z" strokeWidth="0" fill="currentColor" /></svg></button>
            <button id="cancel-camera"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg></button>
          </div>
        </nav>
        <div className="overflow-y-scroll h-[80vh] p-3" id="container-messages">
          {/* Messages */}
        </div>
        <div className={isPickerVisible ? 'block absolute bottom-16 left-5' : 'hidden'}>
          <EmojiPicker data={data} previewPosition="none" onEmojiSelect={(e) => {
            addEmojiInput(e.native)
            setPickerVisible(!isPickerVisible)
          }} />
        </div>
        <div className="absolute right-2 md:right-[1300px] bottom-16 bg-slate-900 p-1 rounded-md hidden" id="files">
          <ul>
            <li className="p-2" onClick={handleFileClick}><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-file-export inline mr-2 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M14 3v4a1 1 0 0 0 1 1h4" /><path d="M11.5 21h-4.5a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v5m-5 6h7m-3 -3l3 3l-3 3" /></svg>Documentos</li><button className="ml-3 bg-orange-500 p-[2px] rounded-sm hidden" id="send-files-document">Enviar</button>
            <li className="p-2" onClick={handleImageClick}><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-photo-scan inline mr-2 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 8h.01" /><path d="M6 13l2.644 -2.644a1.21 1.21 0 0 1 1.712 0l3.644 3.644" /><path d="M13 13l1.644 -1.644a1.21 1.21 0 0 1 1.712 0l1.644 1.644" /><path d="M4 8v-2a2 2 0 0 1 2 -2h2" /><path d="M4 16v2a2 2 0 0 0 2 2h2" /><path d="M16 4h2a2 2 0 0 1 2 2v2" /><path d="M16 20h2a2 2 0 0 0 2 -2v-2" /></svg>Fotos y videos</li><button className="ml-3 bg-orange-500 p-[2px] rounded-sm hidden" id="send-images-videos">Enviar</button>
            <li className="p-2" onClick={handleAudioClick}><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-device-speaker inline mr-2 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 3m0 2a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2z" /><path d="M12 14m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M12 7l0 .01" /></svg>Audio</li><button className="ml-3 bg-orange-500 p-[2px] rounded-sm hidden" id="send-audio-file">Enviar</button>
            <li className="p-2" id="photo"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-camera inline mr-2 cursor-pointer" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M5 7h1a2 2 0 0 0 2 -2a1 1 0 0 1 1 -1h6a1 1 0 0 1 1 1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-9a2 2 0 0 1 2 -2" /><path d="M9 13a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /></svg>Cámara</li>
          </ul>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.pptx"
            name="document"
            id="document"
            className="hidden"
            multiple={true}
          />
          <input
            type="file"
            ref={imageInputRef}
            onChange={handleImageChange}
            accept=".webm,.mp4,.avi,.mkv,.flv,.mov,.divx,.h.264,.xvid,.rm,.jpg,.webp,.png,.bmp,.jpeg,.psd"
            name="media"
            id="media"
            className="hidden"
            multiple={true}
          />
          <input
            type="file"
            ref={audioInputRef}
            onChange={handleAudioChange}
            accept=".wav,.aiff,.au,.flac,.mpeg-4,.shorten,.tta,.atrac,.mp3,.vorbis,.musepack,.aac,.wma,.opus,.ogg,.dsd,.mqa"
            name="audio"
            id="audio"
            className="hidden"
            multiple={true}
          />
        </div>
        <video src="" width="640" height="480" autoPlay className="absolute top-60 md:top-24 md:right-[30%]" id="camera"></video>
        <canvas id="photoCanvas" width="640" height="480" className="hidden"></canvas>
        <div className="absolute top-60 md:top-24 md:right-[30%] hidden" id="picture-preview">
          <img src="" alt="picture-user" id="captured-picture" />
          <div className="flex items-center justify-center gap-16 mt-2">
            <button className="bg-white text-black p-2 rounded-md" id="send-picture">Send</button>
            <button className="bg-white text-black p-2 rounded-md" id="cancel-picture">Cancel</button>
          </div>
        </div>
        <div className="absolute top-60 md:top-24 md:right-[30%] hidden" id="video-preview">
          <video src="" width={640} height={540} id="captured-video" autoPlay controls></video>
          <div className="flex items-center justify-center gap-16 mt-2">
            <button className="bg-white text-black p-2 rounded-md" id="send-video">Send</button>
            <button className="bg-white text-black p-2 rounded-md" id="cancel-video">Cancel</button>
          </div>
        </div>
        <footer className="flex justify-around items-center md:p-2 mt-9 md:mt-0">
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-mood-happy-filled md:relative absolute left-3 cursor-pointer" onClick={emoji} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 3.34a10 10 0 1 1 -14.995 8.984l-.005 -.324l.005 -.324a10 10 0 0 1 14.995 -8.336zm-2 9.66h-6a1 1 0 0 0 -1 1v.05a3.975 3.975 0 0 0 3.777 3.97l.227 .005a4.026 4.026 0 0 0 3.99 -3.79l.006 -.206a1 1 0 0 0 -1 -1.029zm-5.99 -5l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993zm6 0l-.127 .007a1 1 0 0 0 .117 1.993l.127 -.007a1 1 0 0 0 -.117 -1.993z" strokeWidth="0" fill="currentColor" /></svg>
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus md:relative absolute right-12 md:right-0 cursor-pointer" onClick={openFilesSection} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M12 5l0 14" /><path d="M5 12l14 0" /></svg>
          <input type="text" placeholder="Escribe un mensaje" onChange={handleInputMessage} id="send-message" className="md:w-[80%] w-full p-3 rounded-3xl border-none text-white md:indent-0 indent-10" />
          <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send-2 md:relative absolute right-3 cursor-pointer hidden" id="send-message-button" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M4.698 4.034l16.302 7.966l-16.302 7.966a.503 .503 0 0 1 -.546 -.124a.555 .555 0 0 1 -.12 -.568l2.468 -7.274l-2.468 -7.274a.555 .555 0 0 1 .12 -.568a.503 .503 0 0 1 .546 -.124z" /><path d="M6.5 12h14.5" /></svg>
          <button id="send-voice-message" className="md:relative absolute right-3 cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-microphone" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" /><path d="M5 10a7 7 0 0 0 14 0" /><path d="M8 21l8 0" /><path d="M12 17l0 4" /></svg></button>
          <button id="stop-voice-message" className="md:relative absolute right-3 cursor-pointer hidden"><svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-brand-telegram" width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" /></svg></button>
        </footer>
      </section>
    </>
  )
}

export { Chat }