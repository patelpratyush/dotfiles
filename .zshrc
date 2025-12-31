# Enable Powerlevel10k instant prompt. Should stay close to the top of ~/.zshrc.
# Initialization code that may require console input (password prompts, [y/n]
# confirmations, etc.) must go above this block; everything else may go below.
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
	source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

# CodeWhisperer pre block. Keep at the top of this file.
[[ -f "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.pre.zsh" ]] && builtin source "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.pre.zsh"
# If you come from bash you might have to change your $PATH.
#export PATH=$HOME/bin:/usr/local/bin:$PATH
export PATH="/usr/local/bin:$PATH"

# Path to your oh-my-zsh installation.
export ZSH="$HOME/.oh-my-zsh"

# Set name of the theme to load --- if set to "random", it will
# load a random theme each time oh-my-zsh is loaded, in which case,
# to know which specific one was loaded, run: echo $RANDOM_THEME
# See https://github.com/ohmyzsh/ohmyzsh/wiki/Themes
# ZSH_THEME="robbyrussell"
# ZSH_THEME="gozilla"
# ZSH_THEME="powerlevel10k/powerlevel10k"
# ZSH_THEME="cobalt2"
# Starship will be initialized later (after oh-my-zsh)
# Set list of themes to pick from when loading at random
# Setting this variable when ZSH_THEME=random will cause zsh to load
# a theme from this variable instead of looking in $ZSH/themes/
# If set to an empty array, this variable will have no effect.
# ZSH_THEME_RANDOM_CANDIDATES=( "robbyrussell" "agnoster" )

# Uncomment the following line to use case-sensitive completion.
# CASE_SENSITIVE="true"

# Uncomment the following line to use hyphen-insensitive completion.
# Case-sensitive completion must be off. _ and - will be interchangeable.
# HYPHEN_INSENSITIVE="true"

# Uncomment one of the following lines to change the auto-update behavior
# zstyle ':omz:update' mode disabled  # disable automatic updates
# zstyle ':omz:update' mode auto      # update automatically without asking
# zstyle ':omz:update' mode reminder  # just remind me to update when it's time

# Uncomment the following line to change how often to auto-update (in days).
# zstyle ':omz:update' frequency 13

# Uncomment the following line if pasting URLs and other text is messed up.
# DISABLE_MAGIC_FUNCTIONS="true"

# Uncomment the following line to disable colors in ls.
# DISABLE_LS_COLORS="true"

# Uncomment the following line to disable auto-setting terminal title.
# DISABLE_AUTO_TITLE="true"

# Uncomment the following line to enable command auto-correction.
# ENABLE_CORRECTION="true"

# Uncomment the following line to display red dots whilst waiting for completion.
# You can also set it to another string to have that shown instead of the default red dots.
# e.g. COMPLETION_WAITING_DOTS="%F{yellow}waiting...%f"
# Caution: this setting can cause issues with multiline prompts in zsh < 5.7.1 (see #5765)
# COMPLETION_WAITING_DOTS="true"

# Uncomment the following line if you want to disable marking untracked files
# under VCS as dirty. This makes repository status check for large repositories
# much, much faster.
# DISABLE_UNTRACKED_FILES_DIRTY="true"

# Uncomment the following line if you want to change the command execution time
# stamp shown in the history command output.
# You can set one of the optional three formats:
# "mm/dd/yyyy"|"dd.mm.yyyy"|"yyyy-mm-dd"
# or set a custom format using the strftime function format specifications,
# see 'man strftime' for details.
# HIST_STAMPS="mm/dd/yyyy"

# Would you like to use another custom folder than $ZSH/custom?
# ZSH_CUSTOM=/path/to/new-custom-folder

# Which plugins would you like to load?
# Standard plugins can be found in $ZSH/plugins/
# Custom plugins may be added to $ZSH_CUSTOM/plugins/
# Example format: plugins=(rails git textmate ruby lighthouse)
# Add wisely, as too many plugins slow down shell startup.
plugins=(git zsh-autosuggestions zsh-syntax-highlighting web-search)

source $ZSH/oh-my-zsh.sh

# User configuration

# export MANPATH="/usr/local/man:$MANPATH"

# You may need to manually set your language environment
# export LANG=en_US.UTF-8

# Preferred editor for local and remote sessions
# if [[ -n $SSH_CONNECTION ]]; then
#   export EDITOR='vim'
# else
#   export EDITOR='mvim'
# fi

# Compilation flags
# export ARCHFLAGS="-arch x86_64"

# Set personal aliases, overriding those provided by oh-my-zsh libs,
# plugins, and themes. Aliases can be placed here, though oh-my-zsh
# users are encouraged to define aliases within the ZSH_CUSTOM folder.
# For a full list of active aliases, run `alias`.
#
# Example aliases
# alias zshconfig="mate ~/.zshrc"
# alias ohmyzsh="mate ~/.oh-my-zsh"

# opam configuration
[[ ! -r /Users/pratyush/.opam/opam-init/init.zsh ]] || source /Users/pratyush/.opam/opam-init/init.zsh  > /dev/null 2> /dev/null

# CodeWhisperer post block. Keep at the bottom of this file.
[[ -f "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.post.zsh" ]] && builtin source "${HOME}/Library/Application Support/codewhisperer/shell/zshrc.post.zsh"

# To customize prompt, run `p10k configure` or edit ~/.p10k.zsh.
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh
# Lazy-load fzf key bindings to speed up shell startup
# eval "$(fzf --zsh)"  # Commented out - load manually if needed with: eval "$(fzf --zsh)"

# Lazy-load NVM to speed up shell startup
export NVM_DIR="$HOME/.nvm"
# Load nvm only when needed (lazy loading)
nvm() {
  unset -f nvm node npm
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
  nvm "$@"
}
# Lazy-load node and npm
node() {
  unset -f node npm nvm
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  command node "$@"
}
npm() {
  unset -f node npm nvm
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  command npm "$@"
}
# source /usr/local/share/powerlevel10k/powerlevel10k.zsh-theme
# 
# history setup
HISTFILE=$HOME/.zhistory
SAVEHIST=1000
HISTSIZE=999
setopt share_history
setopt hist_expire_dups_first
setopt hist_ignore_dups
setopt hist_verify

# completion using arrow keys (based on history)
bindkey '^[[A' history-search-backward
bindkey '^[[B' history-search-forward
# zsh-autosuggestions and zsh-syntax-highlighting are already loaded via oh-my-zsh plugins
# Only source if not using oh-my-zsh plugins
# source /usr/local/share/zsh-autosuggestions/zsh-autosuggestions.zsh
# source /usr/local/share/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

alias ls="eza --icons=always"
# ---- Zoxide (better cd) ----
alias cd="z"
eval "$(zoxide init zsh)"

# Initialize starship (only once, after oh-my-zsh)
eval "$(starship init zsh)"
export PATH="/usr/local/opt/openjdk/bin:$PATH"
# zsh-autosuggestions already loaded via oh-my-zsh plugins
# ----- Bat (better cat) -----

export BAT_THEME="Nord"

# export PATH="/usr/local/opt/openjdk@8/bin:$PATH"
 export PATH="/usr/local/opt/openjdk@21/bin:$PATH"

. "$HOME/.cargo/env"

export PATH="/Users/pratyush/.npm-global/bin:$PATH"

alias start-apue='VBoxManage startvm "apue" --type headless'
# Cargo bin is already in PATH from .cargo/env below
# Lazy-load lean to avoid slow startup
# export DYLD_LIBRARY_PATH="$(lean --print-prefix)/lib:$DYLD_LIBRARY_PATH"
# export DYLD_LIBRARY_PATH="$(lean --print-prefix)/lib/lean:$DYLD_LIBRARY_PATH"
# CVC5 - use the last one (cvc5)
export CVC5=/usr/local/bin/cvc5

# Deduplicate PATH entries
dedupe_path() {
  local -A seen; local new=; local IFS=':'
  for p in $PATH; do
    [[ -z "$p" || -n "${seen[$p]}" ]] && continue
    seen[$p]=1
    new="${new:+$new:}$p"
  done
  export PATH="$new"
}
dedupe_path
export PATH="/usr/local/opt/postgresql@18/bin:$PATH"
alias linux631='ssh ppatel10@linux.cs631.dotwtf.wtf'
alias omnios631='ssh ppatel10@omnios.cs631.dotwtf.wtf'

# Added by Antigravity
export PATH="/Users/pratyush/.antigravity/antigravity/bin:$PATH"
cursor() { /Applications/Cursor.app/Contents/Resources/app/bin/code "$@" 2>/dev/null; }
