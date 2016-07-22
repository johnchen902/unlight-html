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
    function verifyEnum(theEnum, enumItem) {
        return Object.keys(theEnum).some(
            (x) => theEnum[x] === enumItem);
    }
    function verifyCardType(cardType) {
        if(!verifyEnum(CardType, cardType))
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
    const Stage = Object.freeze({
        move : "move-stage",
        attack : "attack-stage",
        defense : "defense-stage",
    });
    function verifyStage(stage) {
        if(!verifyEnum(Stage, stage))
            throw new Error("no such stage");
    }
    class Skill {
        constructor(name, stage) {
            if(typeof name !== "string")
                throw new TypeError("skill name is not a string");
            verifyStage(stage);
            this.name = name;
            this.stage = stage;
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

    function paintHeaderFooter(ctx, x, y, w, h) {
        ctx.fillStyle = "rgb(196, 196, 196)";
        ctx.fillRect(x, y, w, h);
    }
    function paintCharacter(ctx, x, y, chr) {
        paintHeaderFooter(ctx, x, y, 140, 30);
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
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
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
    function paintEnemyDeckArea(ctx, x, y, deckSize) {
        paintHeaderFooter(ctx, x, y, 250, 30);
        ctx.fillStyle = "rgb(89, 102, 136)";
        ctx.strokeStyle = "black";
        for(let i = 0; i < deckSize; i++) {
            let x0 = x + 195 - i * 20;
            ctx.fillRect(x0, y, 45, 20);
            ctx.beginPath();
            ctx.moveTo(x0, y);
            ctx.lineTo(x0, y + 20);
            ctx.lineTo(x0 + 45, y + 20);
            ctx.lineTo(x0 + 45, y);
            ctx.stroke();
        }
    }
    function paintPointsAndOkArea(ctx, x, y, points) {
        paintHeaderFooter(ctx, x, y, 250, 115);

        // OK
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.arc(x + 65, y + 45, 23, 0, 2 * Math.PI);
        ctx.arc(x + 65, y + 45, 25, 0, 2 * Math.PI);
        ctx.arc(x + 65, y + 45, 27, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "black";
        ctx.font = "24px serif";
        // TODO use TextMetrics if supported
        ctx.fillText("OK", x + 65, y + 54);

        // Points
        ctx.beginPath();
        ctx.moveTo(x + 7, y + 90);
        ctx.lineTo(x + 243, y + 90);
        ctx.stroke();
        ctx.textAlign = "left";
        ctx.textBaseline = "alphabetic";
        ctx.font = "11px serif";
        ctx.fillText("POINTS", x + 7, y + 88);
        ctx.textBaseline = "top";
        ctx.font = "22px serif";
        ctx.fillText("" + points, x + 10, y + 92);
    }
    function paintSkill(ctx, x, y, skill, active) {
        const inactiveStyle = "rgb(50, 50, 50)";
        if(active) {
            let grad = ctx.createLinearGradient(x, y, x + 148, y);
            grad.addColorStop(0, inactiveStyle);
            grad.addColorStop(0.5, "rgb(134, 155, 0)");
            grad.addColorStop(1, inactiveStyle);
            ctx.fillStyle = grad;
        } else {
            ctx.fillStyle = inactiveStyle;
        }
        ctx.fillRect(x, y, 148, 30);

        if(active)
            ctx.fillStyle = "rgb(225, 225, 48)";
        else
            ctx.fillStyle = "rgb(192, 192, 192)";
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.font = "18px serif";
        // TODO use TextMetrics if supported
        ctx.fillText(skill.name, x + 75, y + 20);

        ctx.save();
        ctx.translate(x, y + 30);
        ctx.rotate(-Math.PI / 2);
        var text = "?";
        switch(skill.stage) {
        case Stage.move:
            text = "MOVE";
            ctx.fillStyle = "rgb(213, 3, 255)";
            break;
        case Stage.attack:
            text = "ATK";
            ctx.fillStyle = "rgb(238, 0, 1)";
            break;
        case Stage.defense:
            text = "DEF";
            ctx.fillStyle = "rgb(39, 105, 245)";
            break;
        }
        ctx.fillRect(2, 2, 2, 5);

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "7px serif";
        ctx.fillStyle = "rgb(192, 192, 192)";
        ctx.fillText(text, 5, 2);
        ctx.restore();
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
        const dragonCatfish = new CharacterCard("\u9f8d\u9bf0",
                new CharacterLevel("M", 10), 1200, 4, 6, []);
        paintCharacter(ctx, 0, 0, dragonCatfish);
        paintCharacter(ctx, 170, 0, null);
        paintCharacter(ctx, 340, 0, null);
        // enemy hand
        paintEnemyDeckArea(ctx, 510, 0, 2);
        // enemy skills
        const waterCurtain = new Skill("\u6c34\u5ec9", Stage.attack);
        paintSkill(ctx, 0, 30, waterCurtain, false);
        const bubbles = new Skill("\u6ce1\u6cab", Stage.defense);
        paintSkill(ctx, 147.5, 30, bubbles, false);
        const thunder = new Skill("\u9583\u96fb", Stage.attack);
        paintSkill(ctx, 295, 30, thunder, false);
        const groundBreaking = new Skill("\u64bc\u52d5\u5927\u5730",
                                         Stage.move);
        paintSkill(ctx, 442.5, 30, groundBreaking, false);
        // "quest" / opponent id / raid time
        randomColor();
        ctx.fillRect(590, 30, 170, 30);

        // middle

        // my current character
        randomColor();
        ctx.fillRect(0, 440, 170, 240);
        // my skills
        const exTastyMilk = new Skill("Ex\u7f8e\u5473\u725b\u5976",
                                   Stage.move);
        paintSkill(ctx, 170, 440, exTastyMilk, false);
        const gentleInjection = new Skill("\u6eab\u67d4\u6ce8\u5c04",
                                         Stage.defense);
        paintSkill(ctx, 317.5, 440, gentleInjection, false);
        const exsanguination = new Skill("\u6109\u5feb\u62bd\u8840",
                                        Stage.attack);
        paintSkill(ctx, 465, 440, exsanguination, true);
        const secretDrug = new Skill("\u7955\u5bc6\u82e6\u85e5",
                                    Stage.defense);
        paintSkill(ctx, 612.5, 440, secretDrug, false);
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
        paintPointsAndOkArea(ctx, 510, 565, 5701);
    }
    document.addEventListener("DOMContentLoaded", function() {
        initGame();
    });
})();

