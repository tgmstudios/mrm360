#!/bin/sh

npm install -g nodemon
echo fs.inotify.max_user_watches=524288 | tee -a /etc/sysctl.conf
sysctl -p

sleep infinity
#nodemon