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
    function verifyCardWeight(cardType, cardWeight) {
        function checkRange(min, max) {
            if(cardWeight < min || cardWeight > max)
                throw new RangeError("weight of " + cardType +
                        " shouldn't be " + cardWeight);
        }
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
            verifyCardType(cardType);
            verifyCardWeight(cardType, cardWeight);
            this.type = cardType;
            this.weight = cardWeight;
            Object.freeze(this);
        }
    };
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
    };

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
        randomColor();
        ctx.fillRect(0, 0, 170, 30);
        randomColor();
        ctx.fillRect(170, 0, 170, 30);
        randomColor();
        ctx.fillRect(340, 0, 170, 30);
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
        randomColor();
        ctx.fillRect(170, 650, 170, 30);
        randomColor();
        ctx.fillRect(340, 650, 170, 30);
        // bottom-right panel
        randomColor();
        ctx.fillRect(510, 565, 250, 115);
    }
    document.addEventListener("DOMContentLoaded", function() {
        initGame();
    });
})();

