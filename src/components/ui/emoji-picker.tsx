import React from "react";

// More comprehensive emoji set organized by categories
const emojiCategories = {
  smileys: ["😀","😁","😂","🤣","😊","😍","🥰","😘","😗","😙","😚","😋","😛","😝","😜","🤪","🤨","🧐","🤓","😎","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","😬","🙄","😯","😦","😧","😮","😲","🥱","😴","🤤","😪"],
  hearts: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","♥️","💌","💒"],
  gestures: ["👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👋","🤚","🖐️","✋","🖖","👏","🙌","🤲","🤝","🙏"],
  activities: ["🎉","🎊","🎈","🎁","🎀","🎂","🍰","🧁","🍭","🍬","🍫","🎄","🎆","🎇","✨","🎃","👻","💀","☠️","🦴","🔥","💯","💢","💨","💫","💦","💤"],
};

const allEmojis = Object.values(emojiCategories).flat();

export const EmojiPicker = ({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose?: () => void }) => {
  const [activeCategory, setActiveCategory] = React.useState<keyof typeof emojiCategories>('smileys');

  return (
    <div className="absolute bottom-12 right-0 bg-white border rounded-xl shadow-lg z-50 w-80">
      {/* Category tabs */}
      <div className="flex border-b p-2 gap-1">
        {Object.keys(emojiCategories).map((category) => (
          <button
            key={category}
            className={`px-3 py-1 text-xs rounded-md capitalize transition-colors ${
              activeCategory === category 
                ? 'bg-rose-100 text-rose-600' 
                : 'text-gray-500 hover:bg-gray-100'
            }`}
            onClick={() => setActiveCategory(category as keyof typeof emojiCategories)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>
      
      {/* Emoji grid */}
      <div className="p-2 max-h-48 overflow-y-auto">
        <div className="grid grid-cols-8 gap-1">
          {emojiCategories[activeCategory].map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              className="text-xl p-2 hover:bg-rose-100 rounded-lg focus:outline-none transition-colors"
              onClick={() => {
                onSelect(emoji);
                onClose?.();
              }}
              type="button"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
      
      {/* Recent/Popular emojis */}
      <div className="border-t p-2">
        <div className="text-xs text-gray-500 mb-1">Recently used</div>
        <div className="flex gap-1">
          {allEmojis.slice(0, 10).map((emoji, index) => (
            <button
              key={`recent-${emoji}-${index}`}
              className="text-lg p-1 hover:bg-rose-100 rounded focus:outline-none"
              onClick={() => {
                onSelect(emoji);
                onClose?.();
              }}
              type="button"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
