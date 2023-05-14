# Design

This directory contains the Figma design file that is made before starting to build the project.

Apart from what's shown in the Figma design;

- There needs to be logging that users can see. Creation, deletion, etc. stuff need to be logged.

- The app should have websocket set up. And check the connectivity every 10-20 seconds. If connection is lost, or if the user opens up the app from another place (tab, window, browser, etc.), all the other tabs should be required to reload to continue using. In other words, you can have only one tab open.
