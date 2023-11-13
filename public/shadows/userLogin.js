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
        this.shadow.getElementById('opciones2').addEventListener('click', this.displayCoches.bind(this))
      ////
      this.shadow.querySelectorAll('.modButton').forEach(button => {
        button.addEventListener('click', this.handleModButtonClick.bind(this));
    });
    
    // Agregar el event listener para el botón de "Modify"
    this.shadow.querySelectorAll('.modifyCarButton').forEach(button => {
        button.addEventListener('click', this.actionModifyCar.bind(this));
    });
    // Agregar el event listener para el botón de "delete"
    this.shadow.querySelectorAll('.deleteCarButton').forEach(button => {
        button.addEventListener('click', this.actionDeleteCar.bind(this));
    });

    // Agregar el event listener para el botón de "Create Tabla"
    this.shadow.querySelectorAll('.createTableButton').forEach(button => {
        button.addEventListener('click', this.CreateTable.bind(this));
    });

    // ...
    this.shadow.querySelectorAll('.table2').forEach(button => {
        button.addEventListener('click', this.mostrarTablas.bind(this));
      });
      
    // Llamar a displayCoches automáticamente al cargar la página
    this.mostrarTablas();
    ///////
    // Agregar el event listener para el botón de "Create"

    this.shadow.querySelectorAll('.createCarButton').forEach(button => {
        console.log('Agregando event listener al botón');
        button.addEventListener('click', this.actionCreate.bind(this));
    });
    
    /* this.shadow.querySelectorAll('.table').forEach(button => {
        button.addEventListener('click', this.displayCoches.bind(this));
      });
      
    // Llamar a displayCoches automáticamente al cargar la página
    this.displayCoches(); */


    
    // CREACION TABLA //
    const columnNumberInput = this.shadow.querySelector('#columnNumber');
    const columnFields = this.shadow.querySelector('#columnFields');

    columnNumberInput.addEventListener('input', () => {
        columnFields.innerHTML = '';

        const numberOfColumns = parseInt(columnNumberInput.value, 10);

        for (let i = 0; i < numberOfColumns; i++) {
            const columnDiv = document.createElement('div');
            columnDiv.classList.add('columnField');

            const columnNameInput = document.createElement('input');
            columnNameInput.placeholder = `Nombre columna ${i + 1}`;

            const columnTypeSelect = document.createElement('select');
            const varcharOption = document.createElement('option');
            varcharOption.value = 'VARCHAR';
            varcharOption.text = 'VARCHAR';
            const intOption = document.createElement('option');
            intOption.value = 'INT';
            intOption.text = 'INT';
            columnTypeSelect.appendChild(varcharOption);
            columnTypeSelect.appendChild(intOption);

            columnDiv.appendChild(columnNameInput);
            columnDiv.appendChild(columnTypeSelect);

            columnFields.appendChild(columnDiv);
        }

        columnFields.style.display = 'block';
    });

    // Automàticament, validar l'usuari per 'token' (si n'hi ha)
    await this.actionCheckUserByToken()
} 

  // *******************CREACION FILAS *************************
  async actionCreate() {
    // Obtener todos los inputs dentro del formulario
    let inputs = this.shadow.querySelectorAll('#createCarForm2 input');
    
    // Crear un objeto para almacenar los datos del formulario
    let requestData = { callType: 'actionCreateCar' };

    // Obtener la información de la tabla desde el primer label
    let tabla = this.shadow.querySelector('#createCarForm2 label').getAttribute('tabla');
    requestData.tabla = tabla;
    
    // Iterar sobre cada input y agregar su valor al objeto requestData
    inputs.forEach(input => {
        let inputId = input.id;
        let inputValue = input.value;
        requestData[inputId.toLowerCase()] = inputValue;
    });
    console.log(inputs);
    console.log('actionCreate ejecutado');

    // Mostrar la vista
    this.showView('viewSignUpForm', 'loading');

    // Enviar la solicitud al servidor
    let resultData = await this.callServer(requestData);

    // Verificar el resultado y mostrar la vista correspondiente
    if (resultData.result == 'Coches') {
        this.setUserInfo(resultData.marca, resultData.modelo, resultData.any, resultData.color, resultData.precio);
        this.showView('viewInfo');
    } else {
        console.log("Fallo");
    }      
}

 // ****************** ELIMINAR FILAS ******************************
 async actionDeleteCar() {
    let carIdToDelete = this.shadow.querySelector('#carIdToDelete').value;

    // Mostrar la vista
    this.showView('viewSignUpForm', 'loading');

    // Obtener la información de la tabla desde el primer label
    let tabla = this.shadow.querySelector('#createCarForm2 label').getAttribute('tabla');
    //console.log(tabla);

    let requestData = {
        callType: 'actionDeleteCar',
        carId: carIdToDelete,
        tabla: tabla,
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

    // **************************************MODIFY**********************************************
    
    async actionModifyCar() {
        let carIdToModify = this.shadow.querySelector('#carIdToModify').value;

        let opcionesSelect = this.shadow.querySelector('#opciones');
        let opcionSeleccionada = opcionesSelect.options[opcionesSelect.selectedIndex].value;

        let nuevoValor = this.shadow.querySelector('#nuevo_valor').value;

        // Obtener la información de la tabla desde el primer label
        let tabla = this.shadow.querySelector('#createCarForm2 label').getAttribute('tabla');
        //console.log(tabla);

    
        this.showView('viewSignUpForm', 'loading');

    let requestData = {
        callType: 'actionGetCarInfo',
        carId: carIdToModify,
        opcionSelect: opcionSeleccionada,
        NewValue: nuevoValor,
        tabla: tabla,
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

 // ****************** MOSTRAR TABLA Existentes******************************
 
 async mostrarTablas() {
    try {
      const opciones = this.shadow.getElementById('opciones2');
      console.log(opciones);
      if (opciones) {
        let data = {
            callType: 'actionShowTabla'
        };
        let resultData = await this.callServer(data);
        console.log(resultData);

        if (resultData.result === 'OK') {
        // Borra filas existentes
        opciones.innerHTML = '';
        // Establecer los atributos
        let optionElement = document.createElement('option');

        optionElement.value = '';
        optionElement.textContent = 'Selecciona una opción';
        optionElement.disabled = true;
        optionElement.selected = true;
        opciones.appendChild(optionElement);

        resultData.data.forEach(producto => {
            // Itera sobre las propiedades del objeto coche
            for (const prop in producto) {
                let optionElement = document.createElement('option');

                // Asigna el texto de la propiedad como contenido del <option>
                optionElement.textContent = producto[prop];

                // Asigna el valor de la propiedad como valor del <option>
                optionElement.value = producto[prop];
                
                // Agrega el <option> al elemento <select>
                opciones.appendChild(optionElement);

            }
        });

        //document.appendChild(opciones);

        } else {
            const opciones = this.shadow.getElementById('opciones2');
  
          // Muestra un mensaje de error si no se encontraron coches
        }      
    } else {
        opciones.error("Elemento opciones no encontrado en el DOM");
    }
      
    } catch (error) {

      console.error("Error al mostrar coches:", error);
      // Muestra un mensaje de error en caso de un error en la solicitud
    }
  }


// *******************************************************************************************

 // ****************** MOSTRAR TABLA ******************************
 
 async displayCoches(event) {
    const opcionesMody = this.shadow.getElementById('opciones');
    const opcionesModyTable = this.shadow.getElementById('opciones4');
    // Borra filas existentes
    opcionesMody.innerHTML = '';
    // Borra filas existentes
    opcionesModyTable.innerHTML = '';
    const Seleccionada = event.target;
    const opcionSeleccionada = Seleccionada.value;
    if (!opcionSeleccionada) {
        opcionSeleccionada = Seleccionada.options[0].value;
      }
    console.log(opcionSeleccionada);
    try {
      const tbody = this.shadow.getElementById('tbodyId');
      const thead = this.shadow.getElementById('theadId');
      const form = this.shadow.getElementById('createCarForm2');
      console.log(tbody);
      if (tbody) {
        let data = {
            callType: 'mostrarTabla',
            queTabla: opcionSeleccionada
        };
        let resultData = await this.callServer(data);
        console.log(resultData);

        if (resultData.result === 'OK') {
        // Borra filas existentes
        tbody.innerHTML = '';
        thead.innerHTML = '';
        let tabla = resultData.tabla;
        console.log(tabla);
        form.innerHTML = '';
        let firstIteration = true;
        for (const prop in resultData.data[0]) {
            if (resultData.data[0].hasOwnProperty(prop)) {
                if (!firstIteration) {
                    const label = document.createElement("label");
                    label.textContent = prop;
                    label.for = prop;
                    label.setAttribute("tabla", tabla);
                    const borrar = this.shadow.getElementById("detetebutton");
                    borrar.setAttribute("tabla", tabla);
                    const input = document.createElement("input");
                    input.type = "text";
                    input.id = prop;
        
                    form.appendChild(label);
                    form.appendChild(input);

                    let optionElement2 = document.createElement('option');
                    // Asigna el texto de la propiedad como contenido del <option>
                    optionElement2.textContent = prop;
                    // Asigna el valor de la propiedad como valor del <option>
                    optionElement2.value = prop;
                    // Agrega el <option> al elemento <select>
                    opcionesMody.appendChild(optionElement2);
                    opcionesModyTable.appendChild(optionElement2);
                } else {
                    firstIteration = false;
                }
            }
        }
        
        /* const button = document.createElement("button")
        button.classList.add("createCarButton");
        button.id = "createCarButton";
        button.textContent = " Create ";
        form.appendChild(button); */

        // Llena la tabla con los datos
        const headerRow = document.createElement("tr");
        for (const prop in resultData.data[0]) {
            if (resultData.data[0].hasOwnProperty(prop)) {
                const th = document.createElement("th");
                th.textContent = prop;
                headerRow.appendChild(th);
            }
        }
        thead.appendChild(headerRow);


        // Llena la tabla con los datos
        resultData.data.forEach(coche => {
            const row = document.createElement("tr");
            // Itera sobre las propiedades del objeto coche
            for (const prop in coche) {
                if (coche.hasOwnProperty(prop)) {
                    const cell = document.createElement("td");
                    cell.textContent = coche[prop];
                    row.appendChild(cell);
                }
            }
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

      // *******************CREACION de Tablas *************************
  async CreateTable() {
    var tableName = this.shadow.getElementById('tableName');
    var columnFields = this.shadow.getElementById('columnFields');
    console.log(columnFields);

    if (columnFields) { // Verifica si el elemento existe
        var inputs = columnFields.querySelectorAll('input');
        var selects = columnFields.querySelectorAll('select');
        console.log(inputs);

        var valoresInputs = [];
        var valoresSelects = [];

        inputs.forEach(function(input) {
            valoresInputs.push(input.value);
        });

        selects.forEach(function(select) {
            valoresSelects.push(select.value);
        });

        
    } else {
        console.error('El elemento con id "columnFields" no se encontró en el DOM.');
    }
    let requestData = {
        callType: 'actionCreateTable',
        tableName: tableName.value,
        valoresInputs: valoresInputs,
        valoresSelects: valoresSelects,

    }
    let resultData = await this.callServer(requestData)
    if (resultData.result == 'Tablas') {
        this.setUserInfo(resultData.tableName)
        this.showView('viewInfo')
    } else {
        console.log("Fallo");
    }      
    
}
}

// Defineix l'element personalitzat
customElements.define('user-login', UserLogin)