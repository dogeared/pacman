import { Map } from './map.js';
import { User } from './user.js';
import { Ghost } from './ghost.js';
import { Audio } from './audio.js';
import { Keys } from './keys.js'
import { PacManConfig } from './pacman_config.js';

function Game(wrapper) {

    var WAITING = 5,
        PAUSE = 6,
        PLAYING = 7,
        COUNTDOWN = 8,
        EATEN_PAUSE = 9,
        DYING = 10,
        state = WAITING,
        audio = null,
        ghosts = [],
        ghostSpecs = ["#00FFDE", "#FF0000", "#FFB8DE", "#FFB847"],
        eatenCount = 0,
        level = 0,
        tick = 0,
        ghostPos, userPos,
        stateChanged = true,
        timerStart = null,
        lastTime = 0,
        ctx = null,
        map = null,
        user = null,
        stored = null,
        timer = null;

    wrapper.addEventListener('splitChange', function(e) {
        console.log(e.detail);
        console.log('detected split change');
        if (e.detail['PacMan_SmartGhost']) {
            let ghostMode = Ghost.DUMB;
            let userForGhost = undefined;
            if (e.detail['PacMan_SmartGhost'] === 'on') {
                ghostMode = Ghost.SMART;
                userForGhost = user;
            }
            for (let i = 0; i < ghosts.length; i++) {
                ghosts[i].setMode(ghostMode);
                ghosts[i].setUser(userForGhost);
            }
        } 
    });

    function getTick() {
        return tick;
    };

    function drawScore(text, position) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "12px BDCartoonShoutRegular";
        ctx.fillText(text,
            (position["new"]["x"] / 10) * map.blockSize,
            ((position["new"]["y"] + 5) / 10) * map.blockSize);
    }

    function dialog(text) {
        ctx.fillStyle = "#FFFF00";
        ctx.font = "14px BDCartoonShoutRegular";
        var width = ctx.measureText(text).width,
            x = ((map.width * map.blockSize) - width) / 2;
        ctx.fillText(text, x, (map.height * 10) + 8);
    }

    function soundDisabled() {
        return localStorage["soundDisabled"] === "true";
    };

    function startLevel() {
        user.resetPosition();
        for (let i = 0; i < ghosts.length; i += 1) {
            ghosts[i].reset(i);
        }
        audio.play("start");
        timerStart = tick;
        setState(COUNTDOWN);
    }

    function startNewGame() {
        setState(WAITING);
        level = 1;
        user.reset();
        map.reset();
        map.draw(ctx);
        startLevel();
    }

    function keyDown(e) {
        if (e.keyCode === Keys.N) {
            startNewGame();
        } else if (e.keyCode === Keys.S) {
            audio.disableSound();
            localStorage["soundDisabled"] = !soundDisabled();
        } else if (e.keyCode === Keys.P && state === PAUSE) {
            audio.resume();
            map.draw(ctx);
            setState(stored);
        } else if (e.keyCode === Keys.P) {
            stored = state;
            setState(PAUSE);
            audio.pause();
            map.draw(ctx);
            dialog("Paused");
        } else if (state !== PAUSE) {
            return user.keyDown(e);
        }
        return true;
    }

    function loseLife() {
        setState(WAITING);
        user.loseLife();
        if (user.getLives() > 0) {
            startLevel();
        }
    }

    function setState(nState) {
        state = nState;
        stateChanged = true;
    };

    function collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) +
            Math.pow(ghost.y - user.y, 2))) < 10;
    };

    function drawFooter() {

        var topLeft = (map.height * map.blockSize),
            textBase = topLeft + 17;

        ctx.fillStyle = "#000000";
        ctx.fillRect(0, topLeft, (map.width * map.blockSize), 30);

        ctx.fillStyle = "#FFFF00";

        for (let i = 0, len = user.getLives(); i < len; i++) {
            ctx.fillStyle = "#FFFF00";
            ctx.beginPath();
            ctx.moveTo(255 + (25 * i) + map.blockSize / 2, (topLeft-5) + map.blockSize / 2);

            ctx.arc(255 + (25 * i) + map.blockSize / 2,
                (topLeft-5) + map.blockSize / 2,
                map.blockSize / 2, Math.PI * 0.25, Math.PI * 1.75, false);
            ctx.fill();
        }

        ctx.fillStyle = !soundDisabled() ? "#00FF00" : "#FF0000";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText("s: ♪", 10, textBase);

        ctx.fillStyle = "#FFFF00";
        ctx.font = "14px BDCartoonShoutRegular";
        ctx.fillText("Score: " + user.theScore(), 44, textBase);
        ctx.fillText("Level: " + level, 160, textBase);
        ctx.font = "11px BDCartoonShoutRegular";
        ctx.fillText("Ghosts: " + (ghosts[0].getMode() === Ghost.SMART ? 'SMART' : 'DUMB'), 340, textBase);
        ctx.fillText("PacMan: " + 'Normal', 460, textBase);
    }

    function redrawBlock(pos) {
        map.drawBlock(Math.floor(pos.y / 10), Math.floor(pos.x / 10), ctx);
        map.drawBlock(Math.ceil(pos.y / 10), Math.ceil(pos.x / 10), ctx);
    }

    function mainDraw() {

        var u, nScore;

        ghostPos = [];

        for (let i = 0, len = ghosts.length; i < len; i += 1) {
            ghostPos.push(ghosts[i].move(ctx));
        }
        u = user.move(ctx);

        for (let i = 0, len = ghosts.length; i < len; i += 1) {
            redrawBlock(ghostPos[i].old);
        }
        redrawBlock(u.old);

        for (let i = 0, len = ghosts.length; i < len; i += 1) {
            ghosts[i].draw(ctx);
        }
        user.draw(ctx);

        userPos = u["new"];
        let sirenPlaying = false;
        for (let i = 0, len = ghosts.length; i < len; i += 1) {
            if (ghosts[i].isVunerable() && !sirenPlaying) {
                sirenPlaying = true;
                audio.play("siren");
            }
            if (collided(userPos, ghostPos[i]["new"])) {
                if (ghosts[i].isVunerable()) {
                    audio.play("eatghost");
                    ghosts[i].eat();
                    eatenCount += 1;
                    nScore = eatenCount * 50;
                    drawScore(nScore, ghostPos[i]);
                    user.addScore(nScore);
                    setState(EATEN_PAUSE);
                    timerStart = tick;
                } else if (ghosts[i].isDangerous()) {
                    audio.play("die");
                    setState(DYING);
                    timerStart = tick;
                }
            }
        }
    };

    function mainLoop() {

        var diff;

        if (state !== PAUSE) {
            ++tick;
        }

        map.drawPills(ctx);

        if (state === PLAYING) {
            mainDraw();
        } else if (state === WAITING && stateChanged) {
            stateChanged = false;
            map.draw(ctx);
            dialog("Press N to start a New game");
        } else if (state === EATEN_PAUSE &&
            (tick - timerStart) > (PacManConfig.FPS / 3)) {
            map.draw(ctx);
            setState(PLAYING);
        } else if (state === DYING) {
            if (tick - timerStart > (PacManConfig.FPS * 2)) {
                loseLife();
            } else {
                redrawBlock(userPos);
                for (let i = 0, len = ghosts.length; i < len; i += 1) {
                    redrawBlock(ghostPos[i].old);
                    ghostPos.push(ghosts[i].draw(ctx));
                }
                user.drawDead(ctx, (tick - timerStart) / (PacManConfig.FPS * 2));
            }
        } else if (state === COUNTDOWN) {

            diff = 5 + Math.floor((timerStart - tick) / PacManConfig.FPS);

            if (diff === 0) {
                map.draw(ctx);
                setState(PLAYING);
            } else {
                if (diff !== lastTime) {
                    lastTime = diff;
                    map.draw(ctx);
                    dialog("Starting in: " + diff);
                }
            }
        }

        drawFooter();
    }

    function eatenPill() {
        audio.play("eatpill");
        timerStart = tick;
        eatenCount = 0;
        for (let i = 0; i < ghosts.length; i += 1) {
            ghosts[i].makeEatable(ctx);
        }
    };

    function eatenBiscuit() {
        audio.play("eating");
    }

    function completedLevel() {
        setState(WAITING);
        level += 1;
        map.reset();
        user.newLevel();
        startLevel();
    };

    function keyPress(e) {
        if (state !== WAITING && state !== PAUSE) {
            e.preventDefault();
            e.stopPropagation();
        }
    };

    function init(root, splitClient) {

        var ghost,
            blockSize = wrapper.offsetWidth / 19,
            canvas = document.createElement("canvas");

        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 60 + "px");

        wrapper.appendChild(canvas);

        ctx = canvas.getContext('2d');

        audio = new Audio({ "soundDisabled": soundDisabled });
        map = new Map(blockSize);
        user = new User({
            completedLevel: completedLevel,
            eatenPill: eatenPill,
            eatenBiscuit: eatenBiscuit
        }, map);

        for (let i = 0, len = ghostSpecs.length; i < len; i += 1) {
            ghost = new Ghost({ getTick: getTick }, map, ghostSpecs[i]);
            ghosts.push(ghost);
        }

        map.draw(ctx);
        dialog("Loading ...");

        var extension = 'mp3';
        var audio_files = [
            ["start", root + "audio/opening_song." + extension],
            ["die", root + "audio/die." + extension],
            ["eatghost", root + "audio/eatghost." + extension],
            ["eatpill", root + "audio/eatpill." + extension],
            ["eating", root + "audio/eating.short." + extension],
            ["siren", root + "audio/siren." + extension]
        ];

        load(audio_files, function () { loaded(); });
    };

    function load(arr, callback) {

        if (arr.length === 0) {
            callback();
        } else {
            var x = arr.pop();
            audio.load(x[0], x[1], function () { load(arr, callback); });
        }
    };

    function loaded() {

        dialog("Press N to Start");

        document.addEventListener("keydown", keyDown, true);
        document.addEventListener("keypress", keyPress, true);

        timer = window.setInterval(mainLoop, 1000 / PacManConfig.FPS);
    };

    return {
        init: init
    };

};

export { Game };