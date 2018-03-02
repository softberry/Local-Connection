# LOCALCONNECTION API 2.0


### Connect iframes published on another domain (foreign sandbox)



[![local-connection](https://img.shields.io/npm/v/local-connection.svg?style=for-the-badge)]()
[![npm](https://img.shields.io/npm/l/local-connection.svg?style=for-the-badge)]()
[![GitHub last commit](https://img.shields.io/github/last-commit/softberry/Local-Connection.svg?style=for-the-badge)]()

Get in contact for help from developer:

[![Gitter chat](https://badges.gitter.im/gitterHQ/gitter.png)](https://gitter.im/Local-Connection/Lobby)
[![Get help on Codementor](https://cdn.codementor.io/badges/get_help_github.svg)](https://www.codementor.io/emresakarya?utm_source=github&utm_medium=button&utm_term=emresakarya&utm_campaign=github)
[![Website](https://img.shields.io/website-up-down-green-red/http/emresakarya.com.svg?label=Visit WebSite&style=for-the-badge)](http://www.emresakarya.com/local-connection/)



**IMPORTANT** <span style="color:red">This version doesn't have backward compatibility. As this has a simplified connection method.</span>
## SYNCRONIZE IFRAMES IN WINDOW

This script is used to communicate and synchronise iframes placed in same parent window.

After you add this script to your project, it defines global **`LC`** object.
## How it works:

Each and every window, those served in iFrames and need to connect to each other needs:

- A unique **`key`**. A unique Key is important, so only and only companion windows(iframes) connects to eac other.
- A **`name`** belongs to themselves.
- List of **`names`** of other frames, those having same `key`

If all required parameters given correctly, each connect method search for other windows those having correct **`key`** ,and then tries to match with given **`name`**

As soon as it finds any acceptable window, registers it as an element to **`LC`** object with it's **`name`** parameter.

From now on all connected windows can communicate with each other.

### OPTIONS
|Name|Type| Required|USAGE| Description |
|----|-----|---------|-----|-------|
|`key` | String | YES|`LC.key="BrandName14022016"`|**Unique** connection string. Set this value for all iframes that should communicate each other. Avoid using same key for all projects. |
|`name` | String | YES|`LC.name="left";`|Give a **different** name to each banner.|
|`frames` | String [Array] | YES|`LC.frames="left,top,right";`|Define name of all other banners that will be connected to.|
|`onConnect`|Function|NO|`LC.onConnect= function(){ console.log("Connected");}` |Define a function that will be called as soon as successfully connected to other iframes.|
|`timeout` | Number | NO|`LC.timeout=5;`| Quit trying to connect after defined time in seconds. Default is `0` which means no timeout and keeps continuously try to connect. |
|`onTimeout` | Function | NO|`LC.onTimeout = function(){ console.log("Timed out!"); }` | Define a function that will be called if timeout occurs. It will only be called if `timeout` is greater then `0`. |


### PROPERTIES

### HOW TO USE IT

First thing ist first : link to LocalconnectionAPI (`localconnection.min.js`) script to each `index.html`. 
Minified version doesn't give any message to Browsers Console.
During development it's also possible to use un-minified version `localconnection.js`  to see logs, 
but  It's not suggested to leave un-minified version in the final creative.

Place LocalconnectionAPI (`localconnection.min.js`) preferably just before the closing &lt;/head&gt; tag, as follow:

**`<script src="localconnection.min.js"></script>`**

Then define options in each HTML page (which needs to connect with other) 

    <script>
        new LocalConnection({
            key: 'uniqueConnectionString',
            name: 'left',
            frames: ['top', 'right'],
            onConnect: function () {
                    /*
                        From this point window of left and top will be available as
                        LC.left and LC.top
                        for example :
                    */
                    
                    LC.left.document.getElementsByTagName('body')[0].style.backgroundColor = 'pink';
                    }
            timeout: 0, // If you want to quit after a given amount of time set here as second 
            onTimeout: function () {
                        // If you set timeout property bigger than '0'
                        // this function will be called if no succes in connection
                    }
                });
    </script>
### SAMPLE

A working sample available in ´/test´ folder

**IMPORTANT**

-As soon as local connection established: 
 - runs `onConnect` function. Therefore, stop or pause video, canvas or css animations and initialize these functions through `onConnect` method.
 - all defined frames are available to current `LC` object as child. For example banner `left` becomes child of **`LC`** in the frame `top` as `LC.left` as so on.



