export ZSH="$HOME/.oh-my-zsh"
export ZSH_CUSTOM="$ZSH/custom"

# Clone zsh-autosuggestions plugin if it doesn't exist
if [ ! -d "$ZSH_CUSTOM/plugins/zsh-autosuggestions" ]; then
    git clone https://github.com/zsh-users/zsh-autosuggestions "$ZSH_CUSTOM/plugins/zsh-autosuggestions"
fi

ZSH_THEME="robbyrussell"
plugins=(git node npm zsh-autosuggestions)
source "$ZSH"/oh-my-zsh.sh

# パス設定
export PATH=/home/ccccctl-dev/.npm-global/bin:$PATH
