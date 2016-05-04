# LOCALCONNECTION API

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

### PROPERTIES
|Name|Type| Required|USAGE| Description |
|----|-----|---------|-----|-------|
|`key` | String | YES|`LC.key="BrandName14022016"`|**Unique** connection string. Set this value for all iframes that should communicate each other. Avoid using same key for all projects. |
|`name` | String | YES|`LC.name="left";`|Give a **different** name to each banner.|
|`frames` | String [Array] | YES|`LC.frames="left,top,right";`|Define name of all other banners that will be connected to.|
|`onConnect`|Function|NO|`LC.onConnect= function(){ console.log("Connected");}` |Define a function that will be called as soon as successfully connected to other iframes.|
|`timeout` | Number | NO|`LC.timeout=5;`| Quit trying to connect after defined time in seconds. Default is `0` which means no timeout and keeps continuously try to connect. |
|`onTimeout` | Function | NO|`LC.onTimeout = function(){ console.log("Timed out!"); }` | Define a function that will be called if timeout occurs. It will only be called if `timeout` is greater then `0`. |


### METHODS

It has only one method, which is `connect`.

`connect(key,name,frames,[onConnectFunction,timeout,onTimeoutFunction])`

### HOW TO USE IT

First thing ist first : link to LocalconnectionAPI (`localconnection.min.js`) script to each `index.html`. Minified version doesn't give any message to Browsers Console.
During development it's also possible to use un-minified version `localconnection.dev.js`  to see logs, but  It's not suggested to leave un-minified version in the final creative.


Place LocalconnectionAPI (`localconnection.min.js`) preferably just before the closing &lt;/head&gt; tag, as follow:

If your creative hosted by our servers, you do not need to download and deliver it with your Creative. Simply just place these codes in your index.html file.


**Option 1** : Set all required values for the `LC` Object and then call `LC.connect();` without any parameter :

        <script>
            LC.key = 'uniqueConnectionString';
            LC.name = 'right';
            LC.frames = 'left,top';
            LC.onConnect = function () {
                console.log('Do this as soon as connection established!');
                /*
                 From this point window of left and top will be available as
                 LC.left and LC.top
                 for example :
                 */
                LC.left.document.getElementsByTagName('body')[0].style.backgroundColor = 'pink';
            };
            LC.connect();
        </script>

**Option 2** :
Pass parameters as JavaScript Object :

        <script>
            LC.connect({
                        "key": "uniqueConnectionString",
                        "name": "right",
                        "frames": ['left', 'top'],
                        "onConnect": function () {
                            console.log('Do this as soon as connection established!');
                            /*
                             From this point window of left and top will be available as
                             LC.left and LC.top
                             for example :
                             */
                            LC.left.document.getElementsByTagName('body')[0].style.backgroundColor = 'pink';
                        },
                        "timeout": 7,
                        "onTimeout": function () {
                            console.log('Connection timed out!');
                        }
                    }
            );
        </script>

**Option 3** :
Pass parameters directly to connect function:

        <script>
            LC.connect("uniqueConnectionString", "right", ["left", "top"] | onConnectFunction, timeout, onTimeoutFunction);
        </script>


Option 3 ist the short hand version of the Option 1 and Option 2.  You can use freely any one of these options to establish connection.


**IMPORTANT**



-Last `connect()` method overrides all previously set values.

-As soon as local connection established, runs `onConnect` function. Therefore, stop or pause video, canvas or css animations and initialize these functions through `onConnect` method.

-As soon as local connection established, all defined frames are available to current `LC` object as child. For example banner `left` becomes child of **`LC`** in the frame `top` as `LC.left` as so on.




