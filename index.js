

document.addEventListener('DOMContentLoaded', function() {
    const stage = {
        w: 1280,
        h: 720
    };
    const radToDeg = (rad) => {
        return (rad * 180) / Math.PI;
    };

    const _pexcanvas = document.getElementById("canvas");
    _pexcanvas.width = stage.w;
    _pexcanvas.height = stage.h;
    const ctx = _pexcanvas.getContext("2d");

    const pointer = {
        x: 0,
        y: 0
    };

    let scale = 1;
    let portrait = true;
    let loffset = 0;
    let toffset = 0;
    let mxpos = 0;
    let mypos = 0;

    // Статистика -----------------------------------------------
    let missCounter = 0;
    let killCounter = 0;
    let isGameOver = false;
    const MAX_MISS = 10;
    const life = [];

    const statisticsModal = document.querySelector('.statistics');
    const statisticsSpan = document.querySelector('.statistics span');
    const statisticsBtn = statisticsModal.querySelector('button');
    const lifeRowBlock = document.querySelector('.life');
    const counter = document.querySelector('.counter span');

    // Подготовка блока с жизнями
    for (let i = 0; i < MAX_MISS; i++) {
        life.push(`<div class="life__item"></div>`);
    }
    lifeRowBlock.innerHTML = life.join("");
    const lifeRow = [...lifeRowBlock.querySelectorAll('div')];

    // Сброс надстроек и возобновление игры после проигрыша
    statisticsBtn.addEventListener("click",function(){
        statisticsModal.classList.remove("active");
        missCounter = 0;
        killCounter = 0;
        counter.textContent = killCounter;
        lifeRow.forEach(el => el.classList.remove("lost"));
        bullets = [];
        enemies = [];
        setEnemies();
        ctx.clearRect(0, 0, stage.w, stage.h);
        isGameOver = false;
    })

    // Удар по игроку
    function getMiss(){
        lifeRow[missCounter]?.classList.add("lost")
        missCounter++;
        checkIfGameOver();
    }

    // Удар по багу
    function getHit(){
        killCounter++;
        counter.textContent = killCounter;
    }

    // Остановка при потере всех жизней
    function checkIfGameOver(){
        if (missCounter === MAX_MISS){
            isGameOver = true;
            statisticsSpan.textContent = killCounter;
            statisticsModal.classList.add("active");
        }
    }

// ------------------------------------------------------------------------------- Gamy
    function drawArrow(fromx, fromy, tox, toy, lw, hlen, color) {
        const dx = tox - fromx;
        const dy = toy - fromy;
        const angle = Math.atan2(dy, dx);
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineCap = "round";
        ctx.lineWidth = lw;
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(tox, toy);
        ctx.lineTo(
            tox - hlen * Math.cos(angle - Math.PI / 6),
            toy - hlen * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            tox - (hlen * Math.cos(angle)) / 2,
            toy - (hlen * Math.sin(angle)) / 2
        );
        ctx.lineTo(
            tox - hlen * Math.cos(angle + Math.PI / 6),
            toy - hlen * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    }

    function getCenterOfLine(fromx, fromy, tox, toy){
        const xPoint = (fromx+tox)/2;
        const yPoint = (fromy+toy)/2;
        return {x:xPoint+50, y: yPoint+15};
    }

    function drawBag(fromx,fromy, tox, toy, id) {
        if (id) {
            const dx = tox - fromx;
            const dy = toy - fromy;
            const angle = Math.atan2(dy, dx);
            // если такой баг уже есть, то двигаем его, если нет - создаем новый
            const isExistBug = document.getElementById(`bugCopy_${id}`);
            const point = getCenterOfLine(fromx, fromy, tox, toy);
            if (isExistBug) {
                isExistBug.style.left = point.x;
                isExistBug.style.top = point.y;
                let move;
                if (radToDeg(angle) > 90) {
                    move = `rotate(${90 + radToDeg(angle)}deg)`;
                } else {
                    move = `rotate(${90 + radToDeg(angle)}deg)`;
                }
                isExistBug.style.transform = move;
            } else {
                // скопировали баг
                const bugOrigin = document.getElementById('bugSvg');
                // задали ему свойства
                const newBug = bugOrigin.cloneNode(true);
                newBug.style.left = point.x;
                newBug.style.top = point.y;
                newBug.style.width = "110px"; //TODO скорректировать размер в зависимости от экрана
                newBug.style.height = "150px"; //TODO скорректировать размер в зависимости от экрана
                newBug.setAttribute("id", `bugCopy_${id}`);

                let move;
                if (radToDeg(angle) > 90) {
                    move = `rotate(${90 + radToDeg(angle)}deg)`;
                } else {
                    move = `rotate(${90 + radToDeg(angle)}deg)`;
                }
                newBug.style.transform = move;
                // добавили в контейнер
                const bugContainer = document.getElementById('bugContainer');
                bugContainer.appendChild(newBug);
            }

            //TODO скорректировать размер бага в зависимости от экрана
        }
    }


    drawBag();

    // const colors = [
    //     "#1abc9c",
    //     "#1abc9c",
    //     "#3498db",
    //     "#9b59b6",
    //     "#34495e",
    //     "#16a085",
    //     "#27ae60",
    //     "#2980b9",
    //     "#8e44ad",
    //     "#2c3e50",
    //     "#f1c40f",
    //     "#e67e22",
    //     "#e74c3c",
    //     "#95a5a6",
    //     "#f39c12",
    //     "#d35400",
    //     "#c0392b",
    //     "#bdc3c7",
    //     "#7f8c8d"
    // ];

// очистили контекст перед началом работы
    ctx.clearRect(0, 0, stage.w, stage.h);

// красные стрелки, разлетающиеся при взрыве (попадании синей в красную)
// for (let i = 0; i < 200; i++) {
//   const angle = Math.random() * Math.PI * 2;
//   const length = Math.random() * 250 + 50;
//   const myx = 360 + Math.sin(angle) * length;
//   const myy = 360 - Math.cos(angle) * length;
//   drawArrow(
//     myx,
//     myy,
//     myx + (length / 6) * Math.sin(angle),
//     myy - (length / 6) * Math.cos(angle),
//     length / 30,
//     length / 30,
//     "#c0392b"
//   );
// }

// сохраняет изображение (красных стрелок)
    const explode = new Image();
    explode.src = _pexcanvas.toDataURL("image/png");

// очищаем контекст
    ctx.clearRect(0, 0, stage.w, stage.h);

// серые стрелки вокруг оружия при взрыве
// for (let i = 0; i < 200; i++) {
//   const angle = Math.random() * Math.PI - Math.PI / 2;
//   const length = Math.random() * 480 + 50;
//   const myx = stage.w / 2 + Math.sin(angle) * length;
//   const myy = stage.h - Math.cos(angle) * length;
//   drawArrow(
//     myx,
//     myy,
//     myx + (length / 6) * Math.sin(angle),
//     myy - (length / 6) * Math.cos(angle),
//     length / 30,
//     length / 30,
//     "#2c3e50"
//   );
// }

// сохраняет  серые стрелки в img
    const explodeb = new Image();
    explodeb.src = _pexcanvas.toDataURL("image/png");

// очистили контекст
    ctx.clearRect(0, 0, stage.w, stage.h);

// ctx.fillStyle = "rgba(236,240,241,1)";
// ctx.fillRect(0, 0, stage.w, stage.h);

// стрелочки на фоне
// for (let i = 0; i < 200; i++) {
//   const angle = ((Math.random() * Math.PI) / Math.PI) * 180;
//   const length = Math.random() * 250 + 50;
//   const myx = Math.random() * stage.w;
//   const myy = Math.random() * stage.h;
//   drawArrow(
//     myx,
//     myy,
//     myx + (length / 6) * Math.sin(angle),
//     myy - (length / 6) * Math.cos(angle),
//     length / 30,
//     length / 30,
//     colors[Math.floor(Math.random() * colors.length)]
//   );
// }

    ctx.fillStyle = "rgba(236,240,241,0.9)";
// перезаливает канвас цветом, чтобы стрелочки перерисовывались а не двоились
    ctx.fillRect(0, 0, stage.w, stage.h);
    const back = new Image();
    back.src = _pexcanvas.toDataURL("image/png");

    let angle = 0;
    let ai = true;
    let ait = 0;
    let btm = 0;
    let bullets = [];

    function Bullet() {
        this.x = stage.w / 2 - Math.sin(angle) * 150;
        this.y = stage.h - Math.cos(angle) * 150 - 100;
        this.r = angle;
    }
    let enemies = [];
    function Enemy() {
        this.r = (Math.random() * Math.PI) / (2.5 / 2) - Math.PI / 2.5;
        this.dis = Math.random() * stage.w + stage.h;
        this.x = stage.w / 2 - Math.sin(this.r) * this.dis;
        this.y = stage.h - Math.cos(this.r) * this.dis;
    }

    setEnemies();
    function setEnemies(){
        for (let i = 0; i < 10; i++) {
            enemies.push(new Enemy());
            enemies[i].x += Math.sin(enemies[i].r) * 300;
            enemies[i].y += Math.cos(enemies[i].r) * 300;
        }
    }


// взрывы
    const explosions = [];
    function Explosion(x, y, ty) {
        this.x = x;
        this.y = y;
        this.t = 30;
        this.ty = ty;
    }

    let eturn = 0;
    const cold = [];
    function enginestep() {
        // рисуем бэк
        ctx.drawImage(back, 0, 0);
        if (!ai && ait < Date.now() - 3000) {
            ai = true;
        }
        btm++;
        if (btm > 8) {
            btm = 0;
            bullets.push(new Bullet());
        }

        // рисуем синие стрелки для массива bullets (пуль)
        for (let i = 0; i < bullets.length; i++) {
            // число 20 - скорость с которой улетает пуля
            bullets[i].x -= Math.sin(bullets[i].r) * 20;
            bullets[i].y -= Math.cos(bullets[i].r) * 20;
            drawArrow(
                // число 50 это то насколько длинная линия за стрелкой
                bullets[i].x + Math.sin(bullets[i].r) * 50,
                bullets[i].y + Math.cos(bullets[i].r) * 50,
                bullets[i].x,
                bullets[i].y,
                8,
                8,
                "#2980b9"
            );
            // если улетела пуля по оси х или по у то вырезаем её из массива
            if (bullets[i].x < -100 || bullets[i].x > stage.w + 100) {
                bullets.splice(i, 1);
            }
            if (bullets[i].y < -100 || bullets[i].y > stage.h + 100) {
                bullets.splice(i, 1);
            }
        }

        // рисуем красные стрелки изменяя текущий массив
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].x += Math.sin(enemies[i].r) * 2;
            enemies[i].y += Math.cos(enemies[i].r) * 2;
            // drawArrow(
            //     enemies[i].x - Math.sin(enemies[i].r) * 100,
            //     enemies[i].y - Math.cos(enemies[i].r) * 100,
            //     enemies[i].x,
            //     enemies[i].y,
            //     15,
            //     15,
            //     "#c0392b"
            // );
            drawBag(enemies[i].x - Math.sin(enemies[i].r) * 100,
                enemies[i].y - Math.cos(enemies[i].r) * 100,
                enemies[i].x,
                enemies[i].y, i);

            if (enemies[i].y > stage.h) {
                getMiss();
                enemies[i] = new Enemy();
                explosions.push(new Explosion(stage.w / 2, stage.h, 2));
                shake = true;
                shaket = 0;
            }
            for (let b = 0; b < bullets.length; b++) {
                const dx = enemies[i].x - bullets[b].x;
                const dy = enemies[i].y - bullets[b].y;
                const dis = dx * dx + dy * dy;
                // точность попадания
                if (dis < 40 * 40) {
                    getHit();
                    explosions.push(new Explosion(enemies[i].x, enemies[i].y, 1));
                    enemies[i] = new Enemy();
                    bullets.splice(b, 1);
                }
            }
        }


        // если нет курсора, то автоматическая стрельба
        if (ai) {
            for (let l = 0; l < enemies.length; l++) {
                const dx = enemies[l].x - stage.w / 2;
                const dy = enemies[l].y - stage.h;
                const dis = Math.floor(Math.sqrt(dx * dx + dy * dy));
                const val1 = 10000 + dis;
                const val2 = 1000 + l;
                cold[l] = val1 + "x" + val2;
            }

            cold.sort();
            eturn = parseInt(cold[0].slice(8, 11));
            // функция рандомной стрельбы
            if (parseInt(cold[0].slice(1, 6)) < 800) {
                angle += (enemies[eturn].r - angle) / 8;
            }
        } else {
            // если есть курсор
            const dx = pointer.x - stage.w / 2;
            const dy = pointer.y - stage.h;
            angle = Math.atan(dx / dy);
        }

        //двигаем медведя
        const changeKeyBoardPosition = (angle) => {
            const keyboardWithArms = document.getElementsByClassName(
                "bear__keyboard-arm"
            )[0];
            debugger;
            // console.log(radToDeg(angle));
            // transformOrigin.style.transform = "rotate(" + radToDeg(angle) + "deg)";
            const bearSvg = document.getElementById("bearSvg");
            const bearLeftShoulder = document.getElementById("shoulder-arm");
            const forearmGroup = document.getElementById("forearm-group");
            forearmGroup.style.display = "block";

            if (radToDeg(angle) > 0) {
                bearSvg.style.transform = `scale(1, 1) translateX(-55px)`;
                keyboardWithArms.style.transform = `rotate(${-radToDeg(angle) + 80}deg)`;
                bearLeftShoulder.style.transform = `rotate(${
                    -radToDeg(angle) * 2.3 + 20
                }deg) translate(95px, 82px)`;
                // console.log(radToDeg(angle));
                if (radToDeg(angle) < 13) {
                    forearmGroup.style.transformOrigin = "150px 200px";
                    forearmGroup.style.transform = `rotate(${
                        -radToDeg(angle) * 0.5 + 30
                    }deg) translate(55px, 85px)`;
                } else if (radToDeg(angle) < 35) {
                    forearmGroup.style.transformOrigin = "150px 170px";
                    forearmGroup.style.transform = `rotate(${
                        -radToDeg(angle) * 0.5 + 30
                    }deg) translate(65px, 83px)`;
                } else if (radToDeg(angle) < 64.7) {
                    forearmGroup.style.transformOrigin = "150px 100px";
                    forearmGroup.style.transform = `rotate(${
                        -radToDeg(angle) * 0.8 + 30
                    }deg) translate(77px, 74px)`;
                } else if (radToDeg(angle) < 75) {
                    forearmGroup.style.transformOrigin = "150px 100px";
                    forearmGroup.style.transform = `rotate(${
                        -radToDeg(angle) * 0.9 + 30
                    }deg) translate(77px, 70px)`;
                } else if (radToDeg(angle) < 80) {
                    forearmGroup.style.transformOrigin = "100px 30px";
                    forearmGroup.style.transform = `rotate(${
                        -radToDeg(angle) * 0.9 + 30
                    }deg) translate(25px, 85px)`;
                } else if (radToDeg(angle) < 90) {
                    forearmGroup.style.display = "none";
                }
            } else {
                bearSvg.style.transform = `scale(-1, 1) translateX(-55px)`;
                keyboardWithArms.style.transform = `rotate(${radToDeg(angle) + 80}deg)`;
                bearLeftShoulder.style.transform = `rotate(${
                    radToDeg(angle) * 2.3 + 20
                }deg) translate(95px, 82px)`;
                console.log(radToDeg(angle));

                if (radToDeg(angle) > -13) {
                    forearmGroup.style.transformOrigin = "150px 200px";
                    forearmGroup.style.transform = `rotate(${
                        radToDeg(angle) * 0.5 + 30
                    }deg) translate(55px, 85px)`;
                } else if (radToDeg(angle) > -35) {
                    forearmGroup.style.transformOrigin = "150px 170px";
                    forearmGroup.style.transform = `rotate(${
                        radToDeg(angle) * 0.5 + 30
                    }deg) translate(65px, 83px)`;
                } else if (radToDeg(angle) > -64.7) {
                    forearmGroup.style.transformOrigin = "150px 100px";
                    forearmGroup.style.transform = `rotate(${
                        radToDeg(angle) * 0.8 + 30
                    }deg) translate(77px, 74px)`;
                } else if (radToDeg(angle) > -75) {
                    forearmGroup.style.transformOrigin = "150px 100px";
                    forearmGroup.style.transform = `rotate(${
                        radToDeg(angle) * 0.9 + 30
                    }deg) translate(77px, 70px)`;
                } else if (radToDeg(angle) > -80) {
                    forearmGroup.style.transformOrigin = "100px 30px";
                    forearmGroup.style.transform = `rotate(${
                        radToDeg(angle) * 0.9 + 30
                    }deg) translate(25px, 85px)`;
                } else if (radToDeg(angle) < -90) {
                    forearmGroup.style.display = "none";
                }
            }
        };

        changeKeyBoardPosition(angle);

        // то из чего стреляем
        // drawArrow(
        //   stage.w / 2,
        //   stage.h,
        //   stage.w / 2 - Math.sin(angle) * 150,
        //   stage.h - Math.cos(angle) * 150,
        //   30,
        //   20,
        //   "#2c3e50"
        // );

        for (let e = 0; e < explosions.length; e++) {
            if (+explosions[e].ty === 1) {
                const myimg = explode;
                ctx.globalAlpha = 1 - explosions[e].t / stage.h;
                ctx.drawImage(
                    myimg,
                    explosions[e].x - explosions[e].t / 2,
                    explosions[e].y - explosions[e].t / 2,
                    (explosions[e].t * stage.w) / stage.h,
                    explosions[e].t
                );
                ctx.globalAlpha = 1;
            } else {
                const myimg = explodeb;
                ctx.globalAlpha = 1 - explosions[e].t / stage.h;
                ctx.drawImage(
                    myimg,
                    explosions[e].x - (explosions[e].t * stage.w) / stage.h / 2,
                    stage.h - explosions[e].t,
                    (explosions[e].t * stage.w) / stage.h,
                    explosions[e].t
                );
                ctx.globalAlpha = 1;
            }
        }

        for (let e = 0; e < explosions.length; e++) {
            explosions[e].t += 20;
            if (explosions[e].t > stage.h) {
                explosions.splice(e, 1);
            }
        }
    }

// ------------------------------------------------------------------------------- events
// ------------------------------------------------------------------------------- events
// ------------------------------------------------------------------------------- events
// ------------------------------------------------------------------------------- events

    // function toggleFullScreen() {
    //     const doc = window.document;
    //     const docEl = doc.documentElement;
    //
    //     const requestFullScreen =
    //         docEl.requestFullscreen ||
    //         docEl.mozRequestFullScreen ||
    //         docEl.webkitRequestFullScreen ||
    //         docEl.msRequestFullscreen;
    //     const cancelFullScreen =
    //         doc.exitFullscreen ||
    //         doc.mozCancelFullScreen ||
    //         doc.webkitExitFullscreen ||
    //         doc.msExitFullscreen;
    //
    //     if (
    //         !doc.fullscreenElement &&
    //         !doc.mozFullScreenElement &&
    //         !doc.webkitFullscreenElement &&
    //         !doc.msFullscreenElement
    //     ) {
    //         requestFullScreen.call(docEl);
    //     } else {
    //         cancelFullScreen.call(doc);
    //     }
    // }

    function motchstart(e) {
        mxpos = (e.pageX - loffset) * scale;
        mypos = (e.pageY - toffset) * scale;
    }

    function motchmove(e) {
        mxpos = (e.pageX - loffset) * scale;
        mypos = (e.pageY - toffset) * scale;
        pointer.x = mxpos;
        pointer.y = mypos;
        ai = false;
        ait = Date.now();
    }

    function motchend(e) {}

    window.addEventListener(
        "mousedown",
        function (e) {
            motchstart(e);
        },
        false
    );
    window.addEventListener(
        "mousemove",
        function (e) {
            motchmove(e);
            console.log(e.clientX, e.clientY);
        },
        false
    );
    window.addEventListener(
        "mouseup",
        function (e) {
            motchend(e);
        },
        false
    );
    window.addEventListener(
        "touchstart",
        function (e) {
            e.preventDefault();
            motchstart(e.touches[0]);
        },
        false
    );
    window.addEventListener(
        "touchmove",
        function (e) {
            e.preventDefault();
            motchmove(e.touches[0]);
        },
        false
    );
    window.addEventListener(
        "touchend",
        function (e) {
            e.preventDefault();
            motchend(e.touches[0]);
        },
        false
    );

// ------------------------------------------------------------------------ stager
// ------------------------------------------------------------------------ stager
// ------------------------------------------------------------------------ stager
// ------------------------------------------------------------------------ stager
    function _pexresize() {
        const cw = window.innerWidth;
        const ch = window.innerHeight;
        if (cw <= (ch * stage.w) / stage.h) {
            portrait = true;
            scale = stage.w / cw;
            loffset = 0;
            toffset = Math.floor(ch - (cw * stage.h) / stage.w) / 2;
            _pexcanvas.style.width = cw + "px";
            _pexcanvas.style.height = Math.floor((cw * stage.h) / stage.w) + "px";

            //TODO настроить ресайз окна для жуков
            const bagContainer = document.getElementById('bugContainer');
            bagContainer.style.width = cw + "px";
            bagContainer.style.height = cw + Math.floor((cw * stage.h) / stage.w) + "px";
            // _pexcanvas.style.marginLeft = loffset + "px";
            // _pexcanvas.style.marginTop = toffset + "px";
        } else {
            scale = stage.h / ch;
            portrait = false;
            loffset = Math.floor(cw - (ch * stage.w) / stage.h) / 2;
            toffset = 0;
            _pexcanvas.style.height = ch + "px";
            _pexcanvas.style.width = Math.floor((ch * stage.w) / stage.h) + "px";
            const bagContainer = document.getElementById('bugContainer');
            bagContainer.style.height = ch + "px";
            bagContainer.style.width = Math.floor((ch * stage.w) / stage.h) + "px";
            // _pexcanvas.style.marginLeft = loffset + "px";
            // _pexcanvas.style.marginTop = toffset + "px";
        }
    }

    window.requestAnimFrame = (function () {
        return (
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            }
        );
    })();

    // function sfps(iny) {
    //     return (Math.floor(smoothfps) / 60) * iny;
    // }

    let timebomb = 0;
    let lastCalledTime;
    let fpcount = 0;
    let fpall = 0;
    let smoothfps = 60;
    let thisfps = 60;
    function fpscounter() {
        timebomb++;
        if (!lastCalledTime) {
            lastCalledTime = Date.now();
            return;
        }
        const delta = (Date.now() - lastCalledTime) / 1000;
        lastCalledTime = Date.now();
        const fps = 1 / delta;
        fpcount++;
        fpall += fps;
        if (timebomb > 30) {
            thisfps = parseInt((fpall / fpcount) * 10) / 10;
            fpcount = 0;
            fpall = 0;
            timebomb = 0;
        }
    }

    let shake = false;
    let shaket = 0;
    // let trax;
    // let tray;
    function animated() {
        requestAnimationFrame(animated);
        if (shake) {
            // trax = Math.random() * 60 - 30;
            // tray = Math.random() * 60 - 30;
            // ctx.translate(trax, tray);
        }
        fpscounter();
        ctx.clearRect(0,0,_pexcanvas.width,_pexcanvas.height);
        if(!isGameOver){
            enginestep();
        }
        ctx.fillStyle='#8e44ad';
        ctx.font = "24px arial";

        ctx.textAlign = "left";
        ctx.fillText(thisfps,20,50);
        smoothfps += (thisfps-smoothfps)/100;
        ctx.fillText(cold[0].slice(1,6),20,80);
        ctx.beginPath();
        ctx.arc(pointer.x, pointer.y, 50, 0, Math.PI*2,false);
        ctx.closePath();
        ctx.fill();
        if (shake) {
            // ctx.translate(-trax, -tray);
            shaket++;
            if (shaket > 20) {
                shaket = 0;
                shake = false;
            }
        }
    }

    _pexresize();
    animated();
}, false);
