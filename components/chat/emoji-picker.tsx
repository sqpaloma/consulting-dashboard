"use client";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  // Lista de emojis mais usados
  const commonEmojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
    "😒",
    "😞",
    "😔",
    "😟",
    "😕",
    "🙁",
    "☹️",
    "😣",
    "😖",
    "😫",
    "😩",
    "🥺",
    "😢",
    "😭",
    "😤",
    "😠",
    "😡",
    "🤬",
    "🤯",
    "😳",
    "🥵",
    "🥶",
    "😱",
    "😨",
    "😰",
    "😥",
    "😓",
    "🤗",
    "👍",
    "👎",
    "👌",
    "🤝",
    "👏",
    "🙌",
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "💪",
    "🙏",
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "💯",
    "💢",
    "💥",
    "💫",
    "💦",
    "💨",
    "🔥",
    "⭐",
    "🌟",
    "✨",
  ];

  return (
    <div className="absolute bottom-12 left-0 bg-white border border-gray-200 rounded-lg shadow-lg w-80 max-h-60 overflow-hidden z-50">
      <div className="p-3 border-b border-gray-100">
        <h4 className="text-sm font-medium text-gray-700">Escolha um emoji</h4>
      </div>
      <div className="p-3 overflow-y-auto max-h-48">
        <div className="grid grid-cols-8 gap-1">
          {commonEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="text-xl hover:bg-gray-100 rounded p-2 transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
