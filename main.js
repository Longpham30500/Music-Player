const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PlAYER_STORAGE_KEY = "LONGPHAM_PLAYER";

const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const player = $('.player')
const progress  = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},

    songs: [
        {
            name: "Chưa bao giờ",
            singer: "Trung Quân Idol",
            path: "./assets/music/trung-quan-4k.mp3",
            image: "./assets/img/trung-quan-idol.jpeg"
        },
        {
            name: "Tình đậm sâu, mưa mịt mù",
            singer: "Trung Quân Idol",
            path: "./assets/music/tinh-sau-dam-mua-mit-mu-ost-romance-in-the-rain-x-pp-nguyen-trung-quan-live-at-soul-of-theforest.mp3",
            image: "./assets/img/channels4_profile.jpg"
        },
        {
            name: "Đã sai từ lúc đầu",
            singer: "Bùi Anh Tuấn x Trung Quân Idol",
            path: "./assets/music/atbuianhtuan-live-concert-hoa-nhac-si-atnguyenminhcuongofficial.mp3",
            image: "./assets/img/tải xuống.jpeg"
        },
        {
            name: "Đã Từng",
            singer: "Bùi Anh Tuấn x Dương Hoàng Yến",
            path: "./assets/music/da-tung.mp3",
            image: './assets/img/da-tung.jpeg'
        },
        {
            name: "Một ngàn nỗi đau",
            singer: "Trung Quân idol",
            path: "./assets/music/mot-ngan-noi-dau.mp3",
            image: "./assets/img/mọt-ngan-noi-dau.jpeg"
        },
        {
            name: "Dừng lại vẫn kịp lúc",
            singer: "Trung Quân Idol",
            path: "./assets/music/dung-lai-van-kip-luc.mp3",
            image: "./assets/img/dung-lai-van-kip-luc.jpeg"
        },
        {
            name: "Trái tim bên lề",
            singer: "Bùi Anh Tuấn x Trung Quân Idol",
            path: "./assets/music/trai-tim-ben-le.mp3",
            image: "./assets/img/trai-tim-ben-le.jpeg"
        }
    ],
    setConfig: (key, value) => {
        app.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(app.config))
    },
    render: () => {
        const htmls = app.songs.map((song, index) => {
            return `
                <div class="song ${index === app.currentIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb"
                        style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: () => {
        Object.defineProperty(app, 'currentSong', {
            get: () => {
                return app.songs[app.currentIndex]
            }
        })
    },
    
    handleEvents: () => {
        const cdWidth = cd.offsetWidth
        // CD quay
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 10000, //10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()
        // Phóng to thu nhỏ CD
        document.onscroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi bấm play
        player.onclick = () => {
            if(app.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
            
        }

        // Khi song được play
        audio.onplay = () => {
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()

        }

        // Khi song bị pause
        audio.onpause = () => {
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()


        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = () => {
            if(audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lý khi tua song
        progress.onchange = (e) => {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // Khi next Song
        nextBtn.onclick = () => {
            if(app.isRandom) {
                app.playRandomSong()
            } else {
                app.nextSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        //Khi prev Song
        prevBtn.onclick = () => {
            if(app.isRandom) {
                app.playRandomSong()
            } else {
                app.prevSong()
            } 
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        //Bật/tắt random Song
        randomBtn.onclick = (e) => {
            app.isRandom = !app.isRandom
            app.setConfig('isRandom', app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }

        // Xử lý phát lại một bài hát
        repeatBtn.onclick = (e) => {
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat', app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // Xử lý next Song khi audio ended
        audio.onended = () => {
            if(app.isRepeat) {
                audio.play()
            } else{
                nextBtn.click()
            }
        }

        // lắng nghe khi click vào danh sách bài hát 
        playlist.onclick = (e) => {
            const songNode = e.target.closest('.song:not(.active)')

            if(songNode || e.target.closest('.option')) {
                //Xử lý khi bấm vào song
                if(songNode) {
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    audio.play()
                    app.render()
                }
            }
        }
    },

    scrollToActiveSong: () => {
        setTimeout(() => {
            if(app.currentIndex === 0) {
                $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
            } else {
                $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
            } 
        }, 300)
    },

    loadCurrentSong: () => {
        heading.textContent = app.currentSong.name
        cdThumb.style.backgroundImage = `url('${app.currentSong.image}')`
        audio.src = app.currentSong.path
    },

    loadConfig: () => {
        app.isRandom = app.config.isRandom
        app.isRepeat = app.config.isRepeat
    },

    nextSong: () => {
        app.currentIndex++
        if(app.currentIndex >= app.songs.length) {
            app.currentIndex = 0
        }
        app.loadCurrentSong()
    },

    prevSong: () => {
        app.currentIndex--
        if(app.currentIndex < 0) {
            app.currentIndex = app.songs.length - 1
        }
        app.loadCurrentSong()
    },

    playRandomSong: () => {
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * app.songs.length)
        } while(newIndex === app.currentIndex)
        
        app.currentIndex = newIndex
        app.loadCurrentSong()
    },

    start: () => {
        //Gán cấu hình từ config vào ứng dụng
        console.log(app.loadConfig())
        app.defineProperties()
        app.handleEvents()
        app.loadCurrentSong()
        app.render()
        //Hiển thị trạng thái ban đầu của button repeat & random
        randomBtn.classList.toggle('active', app.isRandom)
        repeatBtn.classList.toggle('active', app.isRepeat)
    }
}

app.start()