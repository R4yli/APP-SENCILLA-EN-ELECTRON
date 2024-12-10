const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const url = require('url');
const path = require('path');

let mainWindow;
let newProductWindow;

// Recargar en desarrollo para navegadores de Windows
if(process.env.NODE_ENV !== 'production') {
  require('electron-reload')(__dirname, {
    electron: path.join(__dirname, '../node_modules', '.bin', 'electron')
  });
}


app.on('ready', () => {

  // La ventana principal
  mainWindow = new BrowserWindow({width: 720, height: 600});

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/index.html'),
    protocol: 'file',
    slashes: true
  }))

  // Menu
  const mainMenu = Menu.buildFromTemplate(templateMenu);
  // Establecer el menú en la ventana principal
  Menu.setApplicationMenu(mainMenu);

  // Si se cierra la ventana principal la aplicación se cierra
  mainWindow.on('closed', () => {
    app.quit();
  });

});


function CrearUnNuevoProducto() {
  newProductWindow = new BrowserWindow({
    width: 400,
    height: 330,
    title: 'Agregar un nuevo producto a la ventana'
  });
  newProductWindow.setMenu(null);

  newProductWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'views/new-product.html'),
    protocol: 'file',
    slashes: true
  }));
  newProductWindow.on('closed', () => {
    newProductWindow = null;
  });
}

// eventos de renderizado IPC (funcion de electron)
ipcMain.on('product:new', (e, newProduct) => {
  // enviar a la ventana principal
  console.log(newProduct);
  mainWindow.webContents.send('product:new', newProduct);
  newProductWindow.close();
});


// Plantilla de menú
const templateMenu = [
  {
    label: 'Archivo',
    submenu: [
      {
        label: 'Nuevo producto',
        accelerator: 'Ctrl+N',
        click() {
          CrearUnNuevoProducto();
        }
      },
      {
        label: 'Remover todos los productos',
        click() {
          mainWindow.webContents.send('products:remove-all');
        }
      },
      {
        label: 'Salir',
        accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// En una mac, simplemente agrega el nombre de la aplicación.
if (process.platform === 'darwin') {
  templateMenu.unshift({
    label: app.getName(),
  });
};

// Herramientas de desarrollo dentro de la app
if (process.env.NODE_ENV !== 'production') {
  templateMenu.push({
    label: 'Herramientas de desarrollo',
    submenu: [
      {
        label: 'Mostrar/ocultar herramientas de desarrollo',
        accelerator: process.platform == 'darwin' ? 'Comand+D' : 'Ctrl+D',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
