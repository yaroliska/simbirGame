

document.addEventListener('DOMContentLoaded', function() {
    const audioGameOver = new Audio('gameover.mp3');
    const audioMiss = new Audio('miss.mp3');
    const audioShoot = new Audio('shoot.mp3');
    const audioKombat = new Audio('kombat.mp3');
    audioKombat.loop = true; 
    audioKombat.play();

    const BULLET_SPEED = 18;
    const BUGS_SPEED = 2;
    let currentBugsSpeed = BUGS_SPEED;
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

    const bearSvg = document.getElementById("bearSvg");

    // Статистика -----------------------------------------------
    let missCounter = 0;
    let killCounter = 0;
    let prevkillCounter = 0;
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
        currentBugsSpeed = BUGS_SPEED;
        counter.textContent = killCounter;
        lifeRow.forEach(el => el.classList.remove("hidden"));
        bullets = [];
        enemies = [];
        setEnemies();
        ctx.clearRect(0, 0, stage.w, stage.h);
        audioShoot.play();
        isGameOver = false;
    })

    // Удар по игроку
    function getMiss(){
        audioMiss.play();
        lifeRow[missCounter]?.classList.add("hidden")
        missCounter++;
        checkIfGameOver();
    }

    // увеличение скорости жуков
   const increaseSpeed = () => {
        currentBugsSpeed+=(currentBugsSpeed/100)*10;
    }

    // Удар по багу
    function getHit(){
        if (Math.floor(killCounter/30) > prevkillCounter) {
            prevkillCounter = Math.floor(killCounter/30);
            increaseSpeed();
        }
        killCounter++;
        counter.textContent = killCounter;
    };

    // Остановка при потере всех жизней
    function checkIfGameOver(){
        if (missCounter === MAX_MISS){
            audioShoot.pause();
            audioGameOver.play();
            isGameOver = true;
            statisticsSpan.textContent = killCounter;
            statisticsModal.classList.add("active");
        }
    }

// ------------------------------------------------------------------------------- Gamy
//     function drawArrow(fromx, fromy, tox, toy, lw, hlen, color) {
//         const dx = tox - fromx;
//         const dy = toy - fromy;
//         const angle = Math.atan2(dy, dx);
//         ctx.fillStyle = color;
//         ctx.strokeStyle = color;
//         ctx.lineCap = "round";
//         ctx.lineWidth = lw;
//         ctx.beginPath();
//         ctx.moveTo(fromx, fromy);
//         ctx.lineTo(tox, toy);
//         ctx.stroke();
//         ctx.beginPath();
//         ctx.moveTo(tox, toy);
//         ctx.lineTo(
//             tox - hlen * Math.cos(angle - Math.PI / 6),
//             toy - hlen * Math.sin(angle - Math.PI / 6)
//         );
//         ctx.lineTo(
//             tox - (hlen * Math.cos(angle)) / 2,
//             toy - (hlen * Math.sin(angle)) / 2
//         );
//         ctx.lineTo(
//             tox - hlen * Math.cos(angle + Math.PI / 6),
//             toy - hlen * Math.sin(angle + Math.PI / 6)
//         );
//         ctx.closePath();
//         ctx.stroke();
//         ctx.fill();
//     }

    const COLORS = [
        "#1abc9c",
        "#1abc9c",
        "#3498db",
        "#9b59b6",
        "#34495e",
        "#16a085",
        "#27ae60",
        "#2980b9",
        "#8e44ad",
        "#2c3e50",
        "#f1c40f",
        "#e67e22",
        "#e74c3c",
        "#95a5a6",
        "#f39c12",
        "#d35400",
        "#c0392b",
        "#bdc3c7",
        "#7f8c8d"
    ];
    function getCenterOfLine(fromx, fromy, tox, toy){
        const xPoint = (fromx+tox)/2;
        const yPoint = (fromy+toy)/2;
        return {x:xPoint-45, y: yPoint-75};
    }

    function drawBag(fromx,fromy, tox, toy, id) {
        if (id!==undefined) {
            const dx = tox - fromx;
            const dy = toy - fromy;
            const angle = Math.atan2(dy, dx);
            // если такой баг уже есть, то двигаем его, если нет - создаем новый
            const isExistBug = document.getElementById(`bugCopy_${id}`);
            const point = getCenterOfLine(fromx, fromy, tox, toy);
            if (isExistBug) {
                isExistBug.style.left = point.x/scale;
                isExistBug.style.top = point.y/scale;
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
                newBug.style.left = point.x/scale;
                newBug.style.top = point.y/scale;
                newBug.style.width = `${90/scale}px`; //TODO скорректировать размер в зависимости от экрана
                newBug.style.height = `${127/scale}px`; //TODO скорректировать размер в зависимости от экрана
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
        }
    }


    drawBag();


    function drawBullet(dx, dy, color) {
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = color;
        ctx.fillText("< / >", dx, dy);
    }



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
        this.y = stage.h - Math.cos(angle) * 150 - 52/scale;
        this.r = angle;
        this.color = COLORS[Math.floor(Math.random() * 19)];
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

    // let eturn = 0;
    // const cold = [];
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

        // рисуем пули из массива bullets (пуль)
        for (let i = 0; i < bullets.length; i++) {
            bullets[i].x -= Math.sin(bullets[i].r) * BULLET_SPEED;
            bullets[i].y -= Math.cos(bullets[i].r) * BULLET_SPEED;
            drawBullet(
                bullets[i].x,
                bullets[i].y,
                bullets[i].color,
            );
            // если улетела пуля по оси х или по у то вырезаем её из массива
            if (bullets[i].x < -100 || bullets[i].x > stage.w + 100) {
                bullets.splice(i, 1);
            }
            if (bullets[i].y < -100 || bullets[i].y > stage.h + 100) {
                bullets.splice(i, 1);
            }
        }

        // рисуем врагов
        for (let i = 0; i < enemies.length; i++) {
            enemies[i].x += Math.sin(enemies[i].r) * currentBugsSpeed;
            enemies[i].y += Math.cos(enemies[i].r) * currentBugsSpeed;
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
            // for (let l = 0; l < enemies.length; l++) {
            //     const dx = enemies[l].x - stage.w / 2;
            //     const dy = enemies[l].y - stage.h;
            //     const dis = Math.floor(Math.sqrt(dx * dx + dy * dy));
            //     const val1 = 10000 + dis;
            //     const val2 = 1000 + l;
            //     cold[l] = val1 + "x" + val2;
            // }
            //
            // cold.sort();
            // eturn = parseInt(cold[0].slice(8, 11));
            // // функция рандомной стрельбы
            // if (parseInt(cold[0].slice(1, 6)) < 800) {
            //     angle += (enemies[eturn].r - angle) / 8;
            // }
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
            const logo = document.getElementById('simbirsoft');
            const logo2 = document.getElementById('simbirsoft2');
            const bearSvg = document.getElementById("bearSvg");
            bearSvg.style.width = `${300/scale}px`;
            bearSvg.style.height = `${396/scale}px`;
            bearSvg.style.bottom = `${-52/scale}px`
            const bearLeftShoulder = document.getElementById("shoulder-arm");
            const forearmGroup = document.getElementById("forearm-group");
            forearmGroup.style.display = "block";

            if (radToDeg(angle) > 0) {
                bearSvg.style.transform = `scale(1, 1) translateX(${-60/scale}px)`;
                keyboardWithArms.style.transform = `rotate(${-radToDeg(angle) + 80}deg)`;
                bearLeftShoulder.style.transform = `rotate(${
                    -radToDeg(angle) * 2.3 + 20
                }deg) translate(95px, 82px)`;
                logo.style.transform = `translate(63px, 83px) scale(1, 1)`;
                logo2.style.transform = `translate(61px, 117px) scale(1, 1)`;
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
                bearSvg.style.transform = `scale(-1, 1) translateX(${-90/scale}px)`;
                logo.style.transform = `translate(70px, 83px) scale(-1, 1)`;
                logo2.style.transform = `translate(79px, 117px) scale(-1, 1)`;

                keyboardWithArms.style.transform = `rotate(${radToDeg(angle) + 80}deg)`;
                bearLeftShoulder.style.transform = `rotate(${
                    radToDeg(angle) * 2.3 + 20
                }deg) translate(95px, 82px)`;
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
            // console.log(e.clientX, e.clientY);
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
            // отделяет взаимодействие с кнопками начала игры
            if(!e.target.classList.contains("btn")){
                e.preventDefault();
                motchstart(e.touches[0]);
            }
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
            // отделяет взаимодействие с кнопками начала игры
            if(!e.target.classList.contains("btn")){
                e.preventDefault();
                motchend(e.touches[0]);
            }
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

            const bagContainer = document.getElementById('bugContainer');
            bagContainer.style.width = cw + "px";
            bagContainer.style.height = Math.floor((cw * stage.h) / stage.w) + "px";

            const welcomeContainer = document.getElementById('welcomeContainer');
            welcomeContainer.style.width = cw + "px";
            welcomeContainer.style.height = Math.floor((cw * stage.h) / stage.w) + "px";

            const lifeAndCounter = document.getElementById('lifeAndCounter');
            lifeAndCounter.style.height = Math.floor((cw * stage.h) / stage.w) + "px";
            lifeAndCounter.style.width = cw + "px";

            const statisticContainer = document.getElementById('statisticContainer');
            statisticContainer.style.height = Math.floor((cw * stage.h) / stage.w) + "px";

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

            const welcomeContainer = document.getElementById('welcomeContainer');
            welcomeContainer.style.height = ch + "px";
            welcomeContainer.style.width = Math.floor((ch * stage.w) / stage.h) + "px";

            const lifeAndCounter = document.getElementById('lifeAndCounter');
            lifeAndCounter.style.height = ch + "px";
            lifeAndCounter.style.width = Math.floor((ch * stage.w) / stage.h) + "px";

            const statisticContainer = document.getElementById('statisticContainer');
            statisticContainer.style.height = ch + "px";
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

        if(!isGameOver){
            enginestep();
        }

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

    const logo = document.getElementById('simbirsoft');
    const logo2 = document.getElementById('simbirsoft2');
    logo.style.transform = `translate(70px, 83px) scale(-1, 1)`;
    logo2.style.transform = `translate(79px, 117px) scale(-1, 1)`;

    const welcomeModal = document.querySelector('.welcome');
    welcomeModal.querySelector('.welcome__slogan').addEventListener('click', function(){
        welcomeModal.classList.add('hidden');
        bearSvg.classList.remove('welcome-bear')
        animated();
        audioShoot.loop = true;
        audioShoot.play();
    });
}, false);
