
# <picture>
<div align=center>
  <h2 style="display: inline-block; vertical-align: center;"><img src ="https://www.stackhero.io/assets/src/images/servicesLogos/openGraphVersions/node-red.png?481ffe83" width="80px" alt="Node-RED Logo"></img></picture> STATUS - Flows </h2>
</div>
  <h4 align="center">A node-red version focused on STATUS project flows</h4>

## 🗨 About
<img align="right" height="200" width="175" alt="GIF" src="https://cdn-icons-gif.flaticon.com/7211/7211818.gif">

Node-RED is an open-source flow-based programming tool designed for visual programming and wiring together hardware devices, APIs, and online services. It provides a browser-based flow editor that allows users to create applications by wiring together nodes to perform tasks.


## ⚙ Running the server locally
### Installation prerequisites
- Before starting with the installation it is necessary to install docker
### Installation Guide for MacOS

1. Open a terminal.

2. Clone the GitHub repository by running the following command:
   ```bash
   git clone https://github.com/statuscompliance/node-red-status
   ```

3. Change to the newly cloned directory:
   ```bash
   cd node-red-status
   ```

4. Grant execution permissions to the `setup.sh` script:
   ```bash
   chmod +x setup.sh
   ```

5. Run the setup script:
   ```bash
   ./setup.sh
   ```

### Installation Guide for Windows

1. Open Git Bash or your preferred terminal on Windows.

2. Clone the GitHub repository with the following command:
   ```bash
   git clone https://github.com/statuscompliance/node-red-status
   ```
3. Find the `node-red-status` folder or execute:
   ```bash
   cd .\node-red-status\
   ```
4.  Run the setup script:
```bash
   .\setup.bat\
```


## 📚 Getting started with Node-RED

At this point, we are going to explain the main Node-RED panel, differentiating it into three main areas. The first area, located in the left column, is where we will find all the available nodes:

<img align="center" height="400" width="700" alt="jpeg" src="https://lh7-us.googleusercontent.com/Ck2TUFCTtJ-qQcICKk70vWhhDW2TJeBp-iWnmKThLX8Flb6iO4W-q5Np2G-tYhw0NxPT8K0HLezTAqOMOpJ5SlVfpmFividLqJQV68863hoWs59t7VFvV0hbgeaOMZXfPLrnV9_o_N2sefyHEuxIG1A">

In Node-RED, a node is a piece of functionality that we can include in the automations. The second area is the central board:

<img align="center" height="400" width="700" alt="jpeg" src="https://lh7-us.googleusercontent.com/JACpz7J5hsxLjIXBdLZvsuZb1BcyNQOXExVgv4QtswQ9eVVBjtvUEqwE_HgBRLEnbMTFZLfrUMeQhPht9sEsWD9u4v5lALtoRgMM3yK_KwpjmFHw_-3RbncNquY3cHFeT5SvB7QJhEJkT8sDklodnfs">

In this board, we can add the nodes and their connections. Finally, in the right column, we can visualise different panels where we can consult relevant information, such as the log console or a summary of all the installed flows:

<img align="center" height="400" width="700" alt="jpeg" src="https://lh7-us.googleusercontent.com/voQNdeMQhQm7y_ZTBanjvw-qFympM9HnefmvEQXo8vNHjRiq1OSdkYFltieO3eicRfXwzlBSN138DfQ59xUN_Ep_5S0xYKBjplqoWqFCfAukaOW4mbXLBYn7fe_xtXOkYd5gOAguTERPj9_6JuyicJc">
