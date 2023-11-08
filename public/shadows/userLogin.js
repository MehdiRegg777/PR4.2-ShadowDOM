class UserLogin extends HTMLElement {
    constructor() {
        super()
        this.shadow = this.attachShadow({ mode: 'open' })
    }

    async connectedCallback() {
        // Carrega els estils CSS
        const style = document.createElement('style')
        style.textContent = await fetch('/shadows/userLogin.css').then(r => r.text())
        this.shadow.appendChild(style)
    
        // Carrega els elements HTML
        const htmlContent = await fetch('/shadows/userLogin.html').then(r => r.text())

        // Converteix la cadena HTML en nodes utilitzant un DocumentFragment
        const template = document.createElement('template');
        template.innerHTML = htmlContent;
        
        // Clona i afegeix el contingut del template al shadow
        this.shadow.appendChild(template.content.cloneNode(true));

        // Definir els 'eventListeners' dels objectes 
        // NO es pot fer des de l'HTML, al ser shadow no funciona
        // Es recomana fer-ho amb '.bind(this, paràmetres ...)' per simplificar les crides a les funcions
        this.shadow.querySelector('#infoBtnLogOut').addEventListener('click', this.actionLogout.bind(this))
        this.shadow.querySelector('#loginForm').addEventListener('submit', this.actionLogin.bind(this))
        this.shadow.querySelector('#loginBtn').addEventListener('click', this.actionLogin.bind(this))
        this.shadow.querySelector('#loginShowSignUpForm').addEventListener('click', this.showView.bind(this, 'viewSignUpForm', 'initial'))
        this.shadow.querySelector('#signUpForm').addEventListener('submit', this.actionLogin.bind(this))
        this.shadow.querySelector('#signUpPassword').addEventListener('input', this.checkSignUpPasswords.bind(this))
        this.shadow.querySelector('#signUpPasswordCheck').addEventListener('input', this.checkSignUpPasswords.bind(this))
        this.shadow.querySelector('#signUpBtn').addEventListener('click', this.actionSignUp.bind(this))
        this.shadow.querySelector('#signUpShowLoginForm').addEventListener('click', this.showView.bind(this, 'viewLoginForm', 'initial'))

      ////
      this.shadow.querySelectorAll('.modButton').forEach(button => {
        button.addEventListener('click', this.handleModButtonClick.bind(this));
    });
    // Agregar el event listener para el botón de "Create"
    this.shadow.querySelectorAll('.createCarButton').forEach(button => {
        button.addEventListener('click', this.actionCreate.bind(this));
    });
    // Agregar el event listener para el botón de "Modify"
    this.shadow.querySelectorAll('.modifyCarButton').forEach(button => {
        button.addEventListener('click', this.actionModifyCar.bind(this));
    });
    // Agregar el event listener para el botón de "delete"
    this.shadow.querySelectorAll('.deleteCarButton').forEach(button => {
        button.addEventListener('click', this.actionDeleteCar.bind(this));
    });
    ///
    // this.shadow.querySelectorAll('.table').forEach(button => {
    //     button.addEventListener('click', this.displayCoches.bind(this));
    // });
    this.shadow.querySelectorAll('.table').forEach(button => {
        button.addEventListener('click', this.displayCoches.bind(this));
      });
      
    // Llamar a displayCoches automáticamente al cargar la página
    this.displayCoches();
    // ...


    // Automàticament, validar l'usuari per 'token' (si n'hi ha)
    await this.actionCheckUserByToken()
} 

  // *******************CREACION FILAS *************************
  async actionCreate() {
    let marcaInput = this.shadow.querySelector('#marcaInput')
    let modeloInput = this.shadow.querySelector('#modeloInput')
    let añoInput = this.shadow.querySelector('#añoInput')
    let colorInput = this.shadow.querySelector('#colorInput')
    let precioInput = this.shadow.querySelector('#precioInput')
    // Mostrar la vista
    this.showView('viewSignUpForm', 'loading')

    let requestData = {
        callType: 'actionCreateCar',
        marca: marcaInput.value,
        modelo: modeloInput.value,
        any: añoInput.value,
        color: colorInput.value,
        precio: precioInput.value,
    }
    let resultData = await this.callServer(requestData)
    if (resultData.result == 'Coches') {
        this.setUserInfo(resultData.marca, resultData.modelo, resultData.any, resultData.color, resultData.precio)
        this.showView('viewInfo')
    } else {
        console.log("Fallo");
    }      
    
}
 // ****************** ELIMINAR FILAS ******************************
 async actionDeleteCar() {
    let carIdToDelete = this.shadow.querySelector('#carIdToDelete').value;

    // Mostrar la vista
    this.showView('viewSignUpForm', 'loading');

    let requestData = {
        callType: 'actionDeleteCar',
        carId: carIdToDelete,
    };

    let resultData = await this.callServer(requestData);
    if (resultData.result == 'OK') {
        // Si la eliminación es exitosa, realizar acciones correspondientes
        // Mostrar mensajes, actualizar la interfaz, etc.
        console.log('Car deleted successfully');
    } else {
        // Si hay un error al eliminar, manejarlo aquí
        // Mostrar mensajes de error, etc.
        console.error('Error deleting car');
    }
}
// ****************** Modo de vistas para el create, edit y delete  ******************************
handleModButtonClick(event) {
    const viewType = event.currentTarget.getAttribute('data-view-type');

    // Ocultar todas las vistas de modificación
    this.shadow.querySelectorAll('.modView').forEach(view => {
        view.style.display = 'none';
    });

    // Mostrar la vista correspondiente
    const viewToShow = this.shadow.querySelector(`#${viewType}Mod`);
    if (viewToShow) {
        viewToShow.style.removeProperty('display');
    }

    // // Puedes realizar otras acciones relacionadas con el botón seleccionado si es necesario
    // switch (viewType) {
    //     case 'Create':
    //         // Acciones específicas para Create
    //         break;
    //     case 'Modify':
    //         // Acciones específicas para Modify
    //         break;
    //     case 'Delete':
    //         // Acciones específicas para Delete
    //         break;
    // }
}

 // ****************** MOSTRAR TABLA ******************************
 async displayCoches() {
    try {
      const tbody = this.shadow.getElementById('tbodyId');
      console.log(tbody);
      if (tbody) {
        let data = {
            callType: 'mostrarTabla'
        };
        let resultData = await this.callServer(data);
        console.log(resultData);

        if (resultData.result === 'OK') {
        // Borra filas existentes
        tbody.innerHTML = '';
        // Llena la tabla con los datos
        resultData.data.forEach(coche => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${coche.ID}</td>
            <td>${coche.Marca}</td>
            <td>${coche.Any}</td>
            <td>${coche.Color}</td>
            <td>${coche.Precio}</td>
            `;
            tbody.appendChild(row);
        });
        } else {
            const tbody = this.shadow.getElementById('tbodyId');
  
          // Muestra un mensaje de error si no se encontraron coches
          tbody.innerHTML = `<tr><td colspan="5">"${data.message}"</td></tr>`;
        }      
    } else {
        console.error("Elemento tbody no encontrado en el DOM");
    }
      
    } catch (error) {

      console.error("Error al mostrar coches:", error);
      // Muestra un mensaje de error en caso de un error en la solicitud
      tbody.innerHTML = `<tr><td colspan="5">Error al obtener los datos de los coches</td></tr>`;
    }
  }


// *******************************************************************************************

    checkSignUpPasswords () {
        // Valida que les dues contrasenyes del 'signUp' siguin iguals
        let refPassword = this.shadow.querySelector('#signUpPassword')
        let refPasswordCheck = this.shadow.querySelector('#signUpPasswordCheck')

        if (refPassword.value == refPasswordCheck.value) {
            this.setViewSignUpStatus('initial')
        } else {
            this.setViewSignUpStatus('passwordError')
        }
    }

    setUserInfo(userName, token) {
        // Guarda o neteja les dades del localStorage
        if (userName != "") {
            window.localStorage.setItem("userName", userName)
            window.localStorage.setItem("token", token)
            this.setViewInfoStatus('logged')
        } else {
            window.localStorage.clear()
            this.setViewInfoStatus('notLogged')
        }
    }

    setViewInfoStatus(status) {
        // Gestiona les diferents visualitzacions de la vista 'viewInfo'
        let refUserName = this.shadow.querySelector('#infoUser')
        let refLoading = this.shadow.querySelector('#infoLoading')
        let refButton = this.shadow.querySelector('#infoBtnLogOut')

        switch (status) {
        case 'loading':
            refUserName.innerText = ""
            refLoading.style.opacity = 1
            refButton.disabled = true
            break
        case 'logged':
            refUserName.innerText = window.localStorage.getItem("userName")
            refLoading.style.opacity = 0
            refButton.disabled = false
            break
        case 'notLogged':
            refUserName.innerText = ""
            refLoading.style.opacity = 0
            refButton.disabled = true
            break
        }
    }

    setViewLoginStatus(status) {
        // Gestiona les diferents visualitzacions de la vista 'viewLoginForm'
        let refError = this.shadow.querySelector('#loginError')
        let refLoading = this.shadow.querySelector('#loginLoading')
        let refButton = this.shadow.querySelector('#loginBtn')

        switch (status) {
        case 'initial':
            refError.style.opacity = 0
            refLoading.style.opacity = 0
            refButton.disabled = false
            break
        case 'loading':
            refError.style.opacity = 0
            refLoading.style.opacity = 1
            refButton.disabled = true
            break
        case 'error':
            refError.style.opacity = 1
            refLoading.style.opacity = 0
            refButton.disabled = true
            break
        }
    }

    setViewSignUpStatus(status) {
        // Gestiona les diferents visualitzacions de la vista 'viewSignUpForm'
        let refPasswordError = this.shadow.querySelector('#signUpPasswordError')
        let refError = this.shadow.querySelector('#signUpError')
        let refLoading = this.shadow.querySelector('#signUpLoading')
        let refButton = this.shadow.querySelector('#signUpBtn')

        switch (status) {
        case 'initial':
            refPasswordError.style.opacity = 0
            refError.style.opacity = 0
            refLoading.style.opacity = 0
            refButton.disabled = false
            break
        case 'loading':
            refPasswordError.style.opacity = 0
            refError.style.opacity = 0
            refLoading.style.opacity = 1
            refButton.disabled = true
            break
        case 'passwordError':
            refPasswordError.style.opacity = 0
            refError.style.opacity = 1
            refLoading.style.opacity = 1
            refButton.disabled = true
        case 'error':
            refPasswordError.style.opacity = 0
            refError.style.opacity = 1
            refLoading.style.opacity = 0
            refButton.disabled = true
            break
        }
    }
    

    showView (viewName, viewStatus) {
        // Amagar totes les vistes
        this.shadow.querySelector('#viewInfo').style.display = 'none'
        this.shadow.querySelector('#viewLoginForm').style.display = 'none'
        this.shadow.querySelector('#viewSignUpForm').style.display = 'none'

        // Mostrar la vista seleccionada, amb l'status indicat
        switch (viewName) {
        case 'viewInfo':
            this.shadow.querySelector('#viewInfo').style.removeProperty('display')
            this.setViewInfoStatus(viewStatus)
            break
        case 'viewLoginForm':
            this.shadow.querySelector('#viewLoginForm').style.removeProperty('display')
            this.setViewLoginStatus(viewStatus)
            break
        case 'viewSignUpForm':
            this.shadow.querySelector('#viewSignUpForm').style.removeProperty('display')
            this.setViewSignUpStatus(viewStatus)
            break
        }
    }

    async actionCheckUserByToken() {
        // Mostrar la vista amb status 'loading'
        this.showView('viewInfo', 'loading')

        // Identificar usuari si hi ha "token" al "LocalStorage"
        let tokenValue = window.localStorage.getItem("token")
        if (tokenValue) {
            let requestData = {
                callType: 'actionCheckUserByToken',
                token: tokenValue
            }
            let resultData = await this.callServer(requestData)
            if (resultData.result == 'OK') {
                // Guardar el nom d'usuari al LocalStorage i també mostrar-lo
                this.setUserInfo(resultData.userName, tokenValue)
                this.setViewInfoStatus('logged')
            } else {
                // Esborrar totes les dades del localStorage
                this.setUserInfo('', '')
                this.showView('viewLoginForm', 'initial')
            }           
        } else {
            // No hi ha token de sessió, mostrem el 'loginForm'
            this.setUserInfo('', '')
            this.showView('viewLoginForm', 'initial')
        }
    }

    async actionLogout() {
        // Mostrar la vista amb status 'loading'
        this.showView('viewInfo', 'loading')

        // Identificar usuari si hi ha "token" al "LocalStorage"
        let tokenValue = window.localStorage.getItem("token")
        if (tokenValue) {
            let requestData = {
                callType: 'actionLogout',
                token: tokenValue
            }
            await this.callServer(requestData)
        } 

        // Tan fa la resposta, esborrem les dades
        this.setUserInfo('', '')
        this.showView('viewLoginForm', 'initial')
    }

    async actionLogin() {
        let refUserName = this.shadow.querySelector('#loginUserName')
        let refPassword = this.shadow.querySelector('#loginPassword')

        // Mostrar la vista
        this.showView('viewLoginForm', 'loading')

        let requestData = {
            callType: 'actionLogin',
            userName: refUserName.value,
            userPassword: refPassword.value
        }

        let resultData = await this.callServer(requestData)
        if (resultData.result == 'OK') {
            this.setUserInfo(resultData.userName, resultData.token)
            this.showView('viewInfo', 'logged')
        } else {
            // Esborrar el password
            refPassword.value = ""

            // Mostrar l'error dos segons
            this.showView('viewLoginForm', 'error')
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mostrar el formulari de login 'inicial'
            this.showView('viewLoginForm', 'initial')
        }           
    }

    async actionSignUp() {
        let refSignUpUserName = this.shadow.querySelector('#signUpUserName')
        let refPassword = this.shadow.querySelector('#signUpPassword')

        // Mostrar la vista
        this.showView('viewSignUpForm', 'loading')

        let requestData = {
            callType: 'actionSignUp',
            userName: refSignUpUserName.value,
            userPassword: refPassword.value
        }
        let resultData = await this.callServer(requestData)
        if (resultData.result == 'OK') {
            this.setUserInfo(resultData.userName, resultData.token)
            this.showView('viewInfo', 'logged')
        } else {
            // Esborrar el password
            refPassword.value = ""
          
            // Mostrar l'error dos segons
            this.showView('viewSignUpForm', 'error')
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Mostrar el formulari de signUp 'inicial'
            this.showView('viewSignUpForm', 'initial')
        }           
    }

    async callServer(requestData) {
        // Fer la petició al servidor
        let resultData = null

        try {
            let result = await fetch('/ajaxCall', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })
            if (!result.ok) {
                throw new Error(`Error HTTP: ${result.status}`)
            }
            resultData = await result.json()
        } catch (e) {
            console.error('Error at "callServer":', e)
        }
        return resultData
    }
}

// Defineix l'element personalitzat
customElements.define('user-login', UserLogin)