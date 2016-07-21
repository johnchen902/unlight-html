(function() {
    "use strict";
    const CardType = Object.freeze({
        sword : "sword",
        gun : "gun",
        defense : "defense",
        move : "move",
        special : "special",
        draw : "draw", // chance
        heal : "heal", // hp recovery
        holyWater : "holyWater",
        curse : "curse", // "break"
        holyGrail : "holyGrail",
        cursedGrail : "cursedGrail",
        // TODO character-specific cards, red heal, green heal
    });
    function verifyCardType(cardType) {
        for(var prop in CardType)
            if(CardType[prop] === cardType)
                return;
        throw new Error("no such card type");
    }
    function verifyCard(cardType, cardWeight) {
        function checkRange(min, max) {
            if(cardWeight < min || cardWeight > max)
                throw new RangeError("weight of " + cardType +
                        " shouldn't be " + cardWeight);
        }
        verifyCardType(cardType);
        if(!Number.isInteger(cardWeight))
            throw new TypeError("card weight not an integer");
        switch(cardType) {
            case CardType.sword:
            case CardType.gun:
                checkRange(1, 8);
                break;
            case CardType.defense:
            case CardType.move:
            case CardType.special:
            case CardType.draw:
            case CardType.curse:
                checkRange(1, 5);
                break;
            case CardType.heal:
                checkRange(1, 3);
                break;
            default:
                checkRange(0, 0);
                break;
        }
    }
    class HalfCard {
        constructor(cardType, cardWeight) {
            verifyCard(cardType, cardWeight);
            this.type = cardType;
            this.weight = cardWeight;
            Object.freeze(this);
        }
    }
    class Card {
        constructor(first, second) {
            if(!(first instanceof HalfCard))
                throw new TypeError("first is not a HalfCard");
            if(!(second instanceof HalfCard))
                throw new TypeError("second is not a HalfCard");
            this.first = first;
            this.second = second;
            Object.freeze(this);
        }
    }
    function verifyCharacterLevel(group, level) {
        if(!Number.isInteger(level))
            throw new TypeError("level is not an integer");
        if(group !== "L" && group !== "R" &&
           group != "EP" && group !== "N" && group !== "M")
       throw new Error("no such character level");
       if(level < 1)
           throw new RangeError("level < 1");
       if(group === "M") {
           if(level > 3 && level != 10)
               throw new RangeError(group + " level > 3 and != 10");
       } else if(group === "L" || group === "R") {
           if(level > 5)
               throw new RangeError(group + " level > 5");
       } else {
           if(level > 1)
               throw new RangeError(group + " level > 1");
       }
    }
    class CharacterLevel {
        constructor(group, level) {
            verifyCharacterLevel(group, level);
            this.group = group;
            this.level = level;
            Object.freeze(this);
        }
        toString() {
            return this.group + this.level;
        }
    }
    class Skill {
        constructor(name) {
            if(typeof name !== "string")
                throw new TypeError("skill name is not a string");
            this.name = name;
            Object.freeze(this);
        }
    }
    class CharacterCard {
        constructor(name, level, hp, atk, def, skills) {
            if(typeof name !== "string")
                throw new TypeError("character name is not a string");
            if(!(level instanceof CharacterLevel))
                throw new TypeError("level is not a CharacterLevel");
            if(!Number.isInteger(hp))
                throw new TypeError("hp is not an integer");
            if(!Number.isInteger(atk))
                throw new TypeError("atk is not an integer");
            if(!Number.isInteger(def))
                throw new TypeError("def is not an integer");
            if(!Array.isArray(skills))
                throw new TypeError("skills is not an array");
            if(hp < 0)
                throw new RangeError("hp < 0");
            if(atk <= 0)
                throw new RangeError("atk <= 0");
            if(def <= 0)
                throw new RangeError("def <= 0");
            if(skills.length > 4)
                throw new Error("more than 4 skills");
            if(!skills.every(x => x instanceof Skill))
                throw new TypeError("skills contains non-Skill");
            this.name = name;
            this.level = level;
            this.hp = hp;
            this.atk = atk;
            this.def = def;
            this.skills = Object.freeze(skills.slice());
            Object.freeze(this);
        }
    }

    function paintCharacter(ctx, x, y, chr) {
        ctx.textBaseline = "top";
        ctx.fillStyle = "rgb(196, 196, 196)";
        ctx.fillRect(x, y, 140, 30);
        if(!chr) {
            ctx.fillStyle = "rgb(188, 188, 188)";
            ctx.fillRect(x + 140, y, 30, 30);
            return;
        }
        ctx.fillStyle = "rgb(48, 60, 88)";
        ctx.fillRect(x + 140, y, 30, 30);
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(x + 2, y + 20);
        ctx.lineTo(x + 138, y + 20);
        ctx.stroke();
        ctx.font = "15px serif";
        ctx.fillStyle = "black";
        ctx.fillText(chr.name, x + 10, y + 5);
        ctx.font = "9px serif";
        ctx.fillText("LV" + chr.level.level, x + 7, y + 22);
        ctx.fillText("ATK " + chr.atk, x + 42, y + 22);
        ctx.fillText("DEF " + chr.def, x + 82, y + 22);
        ctx.fillStyle = "rgb(196, 196, 196)";
        if(chr.hp <= 99) {
            ctx.fillText("HP " + chr.hp, x + 142, y + 22);
        } else {
            ctx.fillText("HP", x + 142, y + 22);
            ctx.font = "14px serif";
            ctx.fillText("\u221e", x + 157, y + 19);
            ctx.font = "9px serif";
        }
    }

    function initGame() {
        function randomColor() {
            function rc() {
                return Math.floor(Math.random() * 256);
            }
            ctx.fillStyle = "rgb(" + rc() + ", " + rc() +
                    ", " + rc() + ")";
        }
        var canvas = document.getElementById("unlight");
        var ctx = canvas.getContext("2d");
        // enemy characters
        const testMob = new CharacterCard("\u9f8d\u9bf0",
                new CharacterLevel("M", 10), 1200, 4, 6, []);
        paintCharacter(ctx, 0, 0, testMob);
        paintCharacter(ctx, 170, 0, null);
        paintCharacter(ctx, 340, 0, null);
        // enemy hand
        randomColor();
        ctx.fillRect(510, 0, 250, 30);
        // enemy skills
        randomColor();
        ctx.fillRect(0, 30, 150, 30);
        randomColor();
        ctx.fillRect(150, 30, 150, 30);
        randomColor();
        ctx.fillRect(300, 30, 150, 30);
        randomColor();
        ctx.fillRect(450, 30, 150, 30);
        // "quest" / opponent id / raid time
        randomColor();
        ctx.fillRect(600, 30, 160, 30);

        // middle

        // my current character
        randomColor();
        ctx.fillRect(0, 440, 170, 240);
        // my skills
        randomColor();
        ctx.fillRect(170, 440, 147, 30);
        randomColor();
        ctx.fillRect(317, 440, 147, 30);
        randomColor();
        ctx.fillRect(464, 440, 147, 30);
        randomColor();
        ctx.fillRect(611, 440, 147, 30);
        // my hand
        randomColor();
        ctx.fillRect(170, 470, 590, 95);
        // chat
        randomColor();
        ctx.fillRect(170, 565, 340, 85);
        // my other characters
        const tyrrell = new CharacterCard("\u6cf0\u745e\u723e",
                new CharacterLevel("R", 2), 9, 8, 8, []);
        paintCharacter(ctx, 170, 650, tyrrell);
        const evelyn = new CharacterCard("\u4f0a\u8299\u7433",
                new CharacterLevel("R", 1), 8, 8, 7, []);
        paintCharacter(ctx, 340, 650, evelyn);
        // bottom-right panel
        randomColor();
        ctx.fillRect(510, 565, 250, 115);
    }
    document.addEventListener("DOMContentLoaded", function() {
        initGame();
    });
})();

