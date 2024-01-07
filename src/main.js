const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron/main')
const path = require('node:path')

require('electron-reload')(__dirname);

let win;
let secundaria;

//Ventana principal
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
    //  preload: path.join(__dirname, 'preload.js')
    nodeIntegration: true,
    contextIsolation: false
  }

  })

  win.loadFile('src/index.html')

  win.on('closed', () => {
    if (secundaria) {
      secundaria.close()
    }
  })
}

//Ventana secundaria
function crearNuevoProducto() {
  secundaria = new BrowserWindow({
    width: 400,
    height: 330,
    title: 'Añadir nuevo producto',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  secundaria.loadFile('src/nuevo-producto.html')

  secundaria.once('ready-to-show', () => {
    secundaria.setMenu(null);
  })

  secundaria.on('closed', () => {
    secundaria = null;
  })
}

//Crear ventana
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  const mainMenu = Menu.buildFromTemplate(templateMenu);
  Menu.setApplicationMenu(mainMenu);
})

ipcMain.on('product:new', (e, newProduct) => {
  console.log(newProduct);
  win.webContents.send('product:new', newProduct);
  secundaria.close();
});

//Crear submenu
const templateMenu = [{
  label: 'Opciones',
  submenu: [
    {
      label: 'Nuevo producto',
      accelerator: 'Ctrl+N',
      click() {
        //dialog.showMessageBox({ message: "Nuevo producto" });
        crearNuevoProducto();
      }
    },
    {
      label: 'Remover productos',
      click() {
        win.webContents.send('products:remove-all');
      }
    },
    {
      label: 'Cerrar',
      accelerator: process.platform == 'darwin' ? 'command+Q' : 'Ctrl+Q',
      click() {
        app.quit();
      }
    }
  ]
}
];

//cerrar app
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

if(process.platform === 'darwin') {
  templateMenu.unshift({
    label: app.getName()
  });
}

if(process.env.NODE_ENV !== 'production') {
  templateMenu.push({
    label: "Desarrollo",
    submenu: [
      {
        label: 'Mostrar/Ocultar',
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
