import io from './app.js'

var mainPage = document.getElementById('container')
var loginPage = document.getElementById('loginDiv')

socket.on('validLogin', function () {
    loginPage.style.display = 'none'
    mainPage.style.display = 'block'
})