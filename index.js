import FileUploader from './main.js';

const fileInput = document.getElementById('fileInput');
const uploadButton = document.getElementById('uploadButton');


const uploader = new FileUploader({
    workerPoolSize: 5,
    fileReaderPoolSize: 5,
    chunkSize: 1024 * 1024 * 20,
    uploadWorkerConfigHandler: (innerQuery) => {
        console.log(innerQuery)
        return {innerQuery}
    }
});
let progress=document.getElementById('progress-line')
uploader.addEventListener('hashProgress', (event) => {
    console.log('Hash progress:', event.detail);
    progress.setAttribute('value',~~(event.detail.progress))

});

uploader.addEventListener('uploadProgress', (event) => {
    console.log('Upload progress:', event.detail);
});

uploader.addEventListener('hashCompleteEvent', (event) => {
    console.log('Hash Completed:', event.detail);
});

uploadButton.addEventListener('click', () => {
    const files = fileInput.files;

    if (files.length === 0) {
        alert('Please select one or more files to upload.');
        return;
    }

    for (const file of files) {
        uploader.upload(file,{
            url: 'http://localhost:3000/upload',
            params: {
                test:'123'
            }
        }).catch(e=>{
            console.log('上传失败',e)

        })
    }
});