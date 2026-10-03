---
title: "Getting started with tmux"
description: "tmux is an amazing tool for terminal multiplexing. It was tricky to switch from screen, but this write-up guides you to a clean transition into the world of tmux."
date: 2013-03-21
image: /images/posts/getting-started-with-tmux/Tmux_logo.svg.png
---

As a long-time user of GNU screen, I knew it would be difficult to switch, but I've made the move and am so far pretty happy. tmux does all the same things that screen does and was a lot easier to customize. I figured I would share [my tmux configuration file](https://github.com/jgeewax/dotfiles/blob/master/tmux.conf) and some of the things that made the switch relatively painless.

## Keyboard bindings

I changed the default keyboard bindings to be more like screen:

- `Ctrl-b` is the default for tmux; I prefer `Ctrl-a`.
- `Ctrl-(left/right) arrow` to move between windows. No screen equivalent (that I know of).
- `Ctrl-a` twice to go "back".
- Setting `Ctrl-a, r` to reload the config file made it very easy to debug.
- Status bar at the bottom

I set my status bar to use the session name and my machine name on the far left, open tab names centered in the middle, and the system time and date on the far right.

## Project-specific configurations (and attach tool)

There's a cool [project called `tat`](https://github.com/ryandotsmith/tat) that does some neat things to make project-specific configurations really easy to set up, and attach to them later on. It also includes tab-completion for existing sessions and your project directory names.

With `tat` you can create a `.tmux` file in your project directory, which will be run with the session name as first argument. You can use this to configure your project work space easily and consistently. Here's one of my example `.tmux` project files:

```
# The session name should have been passed in, but if not
# default to 'default-session-name'
session=${1-"default-session-name"}

# Create and name some windows.
tmux rename-window -t $session:1 bash
tmux new-window -t $session:2 -n webserver
tmux new-window -t $session:3 -n python
tmux new-window -t $session:4 -n templates
tmux new-window -t $session:5 -n js
tmux new-window -t $session:6 -n less

# Configure the various windows.
tmux send-keys -t $session:2 "make serve" C-m
tmux send-keys -t $session:4 "cd templates && clear" C-m
tmux send-keys -t $session:5 "cd media/ && clear" C-m
tmux send-keys -t $session:6 "cd media/less/ && clear" C-m

# Attach to the first window.
tmux select-window -t $session:1
```

## Tab-completion

Enabling tab-completion for `tmux` was easy. On Ubuntu I did the following:

```bash
$ sudo curl https://raw.github.com/mithro/rcfiles/master/bash/completion/tmux > /usr/share/bash-completion/completions/tmux
```
