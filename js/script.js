window.addEventListener('DOMContentLoaded', () => {

    // TABS
    const tabs = document.querySelectorAll('.tabheader__item');
    const tabsContent = document.querySelectorAll('.tabcontent');
    const tabsParent = document.querySelector('.tabheader__items');

    function hideTabContent() {
        tabsContent.forEach(tab => {
            tab.classList.add('hide');
            tab.classList.remove('show', 'fade');
        });

        tabs.forEach(tab => {
            tab.classList.remove('tabheader__item_active');
        });
    }

    function showTabContent(tab = 0) {
        tabsContent[tab].classList.add('show', 'fade');
        tabsContent[tab].classList.remove('hide');
        tabs[tab].classList.add('tabheader__item_active');
    }

    hideTabContent();
    showTabContent();

    tabsParent.addEventListener('click', (e) => {
        const target = e.target;

        if(target && target.classList.contains('tabheader__item')) {
            tabs.forEach((tab, index) => {
                if(target == tab) {
                    hideTabContent();
                    showTabContent(index);
                }
            });
        }

    });

    // TIMER

    const deadline = '2024-04-10';
    
    function getTimeRemaining(endtime) {
        let days, hours, minutes, seconds;
        const t = Date.parse(endtime) - Date.parse(new Date());

        if(t <= 0) {
            days = 0;
            hours = 0;
            minutes = 0;
            seconds = 0;
        } else {
            days = Math.floor(t / (1000 * 60 * 60 * 24));
            hours = Math.floor((t / (1000 * 60 * 60) % 24)); 
            minutes = Math.floor((t / 1000 / 60) % 60);
            seconds = Math.floor((t / 1000) % 60);
        }

        return {
            'total': t,
            'days': days,
            'hours': hours,
            'minutes': minutes,
            'seconds': seconds
        };
    }

    function getZero(num) {
        if(num >= 0 && num < 10) {
            return `0${num}`;
        } else {
            return num;
        }
    }

    function setClock(selector, endtime) {
        const timer = document.querySelector(selector);
        const days = timer.querySelector('#days');
        const hours = timer.querySelector('#hours');
        const minutes = timer.querySelector('#minutes');
        const seconds = timer.querySelector('#seconds');
        const timeInterval = setInterval(updateClock, 1000);

        updateClock();

        function updateClock() {
            const t = getTimeRemaining(endtime);
 
            days.innerHTML = getZero(t.days);
            hours.innerHTML = getZero(t.hours);
            minutes.innerHTML = getZero(t.minutes);
            seconds.innerHTML = getZero(t.seconds);

            if(t.total <= 0) {
                clearInterval(timeInterval);
            }
        }
    }
    setClock('.timer', deadline);

    // MODAL WINDOW

    const modalBtns = document.querySelectorAll('[data-modal]');
    const modalWindow = document.querySelector('.modal');
    // const modalCloseWindow = document.querySelector('[data-close]'); Из-за динамического создание (X) в форме, обрабочики событий не будут работать, нужго использовать ДЕЛЕГИРОВАНИЕ событий

    modalBtns.forEach(btn => {
        btn.addEventListener('click', openModal);   
    });

    function openModal() {
        modalWindow.classList.add('show');
        modalWindow.classList.remove('hide');
        document.body.style.overflow = 'hidden';
        clearInterval(modalTimerId);
    }

    function closeModal() {
        modalWindow.classList.remove('show');
        modalWindow.classList.add('hide');
        document.body.style.overflow = 'visible';
    }

    // modalCloseWindow.addEventListener('click', closeModal);

    modalWindow.addEventListener('click', (e) => {
        const target = e.target;

        if(target === modalWindow || target.getAttribute('data-close') == '') {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.code === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

    // Спустя 1 мин, вызов МОДАЛКИ 
    const modalTimerId = setTimeout(openModal, 60000);  

    function showModalByScroll() {
        if(window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight - 1) {
            openModal();
            window.removeEventListener('scroll', showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);

    // MENU (using class for card-menu)

    class MenuCard {
        constructor(src, altForSrc, title, description, price, parentSelector, ...classes) {
            this.src = src;
            this.altimg = altForSrc;
            this.title = title;
            this.description = description;
            this.price = price;
            this.transfer = 36;
            this.changeUAHToUSD();
            this.parentSelector = document.querySelector(parentSelector);
            this.classes = classes;
        }

        // Changing Currency
        changeUAHToUSD() { 
            this.price *= this.transfer;
        }

        render() {
            const element = document.createElement('div');

            // Проверка на ДОБАВЛЕНЫ ли классы в элементы
           if(this.classes.length === 0) {
                this.element = 'menu__item';
                element.classList.add(this.element);
           } else {
                this.classes.forEach(className => {
                    element.classList.add(className);
                });
           }
            // Добавление Элемента в группу!
            element.innerHTML = `
                <img src=${this.src} alt=${this.altForSrc}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.description}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `;

            this.parentSelector.append(element);
        }
    }
      
      const getResource = async (url) => {
        const res = await fetch(url);
        
        if(!res.ok) {
            throw new Error(`Coundn't fetch ${url}, status: ${res.status}`); 
        }

        return await res.json();
    };

    // ! 1 Способ = Для Шаблонизация!
    // NEW METHOD - Создание карточки на сервере
    getResource(`http://localhost:3000/menu`)
        .then(data => {
            data.forEach(({img, altimg, title, descr, price}) => {
                new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
            });
        });

    // ! 2 Способ = Еслт нужно построить только 1 раз! 
    // getResource(`http://localhost:3000/menu`)
    //     .then(data => createCard(data));

    // function createCard(data) {
    //     data.forEach(({img, altimg, title, descr, price}) => {
    //         const element = document.createElement('div');

    //         element.classList.add('menu__item');

    //         element.innerHTML = `
    //             <img src=${img} alt=${altimg}>
    //             <h3 class="menu__item-subtitle">${title}</h3>
    //             <div class="menu__item-descr">${descr}</div>
    //             <div class="menu__item-divider"></div>
    //             <div class="menu__item-price">
    //                 <div class="menu__item-cost">Цена:</div>
    //                 <div class="menu__item-total"><span>${price * 36}</span> грн/день</div>
    //             </div>
    //         `;

    //         document.querySelector('.menu .container').append(element);
    //     });
    // }

    // ! 3 Способ = Использование __Axios__!
    // axios.get(`http://localhost:3000/menu`)
    //     .then(data => {
    //         data.data.forEach(({img, altimg, title, descr, price}) => {
    //             new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
    //         });
    //     });

    // OLD METHOD - Создание карточки на сервере
    // new MenuCard(
    //     "img/tabs/vegy.jpg",
    //     "vegy",
    //     'Меню "Фитнес"',
    //     'Меню "Фитнес" - это новый подход к приготовлению блюд: больше свежих овощей и фруктов. Продукт активных и здоровых людей. Это абсолютно новый продукт с оптимальной ценой и высоким качеством!',
    //     9,
    //     ".menu .container",
    //     'menu__item',
    //     'big'
    // ).render();

    // new MenuCard(
    //     "img/tabs/elite.jpg",
    //     "elite",
    //     'Меню “Премиум”',
    //     'В меню “Премиум” мы используем не только красивый дизайн упаковки, но и качественное исполнение блюд. Красная рыба, морепродукты, фрукты - ресторанное меню без похода в ресторан!',
    //     15,
    //     ".menu .container",
    //     'menu__item'
    // ).render();

    // new MenuCard(
    //     "img/tabs/post.jpg",
    //     "post",
    //     'Меню "Постное"',
    //     'Меню “Постное” - это тщательный подбор ингредиентов: полное отсутствие продуктов животного происхождения, молоко из миндаля, овса, кокоса или гречки, правильное количество белков за счет тофу и импортных вегетарианских стейков.',
    //     12,
    //     ".menu .container",
    //     'menu__item'
    // ).render();

    // FORMS SERVER (POST-METHOD)

    const forms = document.querySelectorAll('form');

    const message = {
        loading: 'img/form/spinner.svg',
        success: 'Done, we will contact you shortly!',
        failure: 'Error, something goes wrong!'
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    function bindPostData(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            // Создание блока оповещение!
            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display: block;
                margin: 0 auto;
            `;
            // form.append(statusMessage);
            form.insertAdjacentElement('afterend', statusMessage);

            // Создание Запроса(OLD METHOD) 
            // const request = new XMLHttpRequest();
            // request.open('POST', 'server.php');

            // Запрос в JSON-формате
            // request.setRequestHeader('Content-type', 'multipart/form-data'); - Специальная ОШИБКА!
            // OLD METHOD, создания HEADERS!
            // request.setRequestHeader('Content-type', 'application/json'); // Для перевода в JSON-формат!
            const formData = new FormData(form);

            // ПЕРЕВОД в JSON(OLD-METHOD)
            // const object = {};
            // formData.forEach(function(value, key) {
            //     object[key] = value;
            // });

            // ПЕРЕВОД в JSON(NEW-METHOD) + entries()
            const json = JSON.stringify(Object.fromEntries(formData.entries()));


            // Для OLD METHOD
            // Отправка на сервер запрос, конвертированный в JSON-формате!
            // request.send(json);

            postData('http://localhost:3000/requests', json)
            .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset();
            });

            // OLD METHOD FOR XML 
            // Обработка статуса формы!
            // request.addEventListener('load', () => {
            //     if(request.status === 200) {
            //         console.log(request.response);
            //         showThanksModal(message.success);
            //         form.reset();
            //         setTimeout(() => {
            //             statusMessage.remove();
            //         }, 2000);
            //     } else {
            //         showThanksModal(message.failure);
            //     }
            // });
        });
    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        openModal();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div class="modal__close" data-close>x</div>
                <div class="modal__title">${message}</div>
            </div>
        `;
        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            closeModal();
        }, 5000);
    }
    
    // !SLIDERS
    const slider = document.querySelector('.offer__slider');
    const slidesWrapper = document.querySelector('.offer__slider-wrapper'); // FOR SLIDER CAROUSEL
    const slidesField = document.querySelector('.offer__slider-inner');     // FOR SLIDER CAROUSEL
    const slidesWidth = window.getComputedStyle(slidesWrapper).width;       // FOR SLIDER CAROUSEL
    const slides = document.querySelectorAll('.offer__slide');
    const slideCurrent = document.querySelector('#current');
    const slideTotal = document.querySelector('#total');
    const sliderPrevArrow = document.querySelector('.offer__slider-prev');
    const sliderNextArrow = document.querySelector('.offer__slider-next');
    let slideIndex = 1;
    let offset = 0;                                                         // FOR SLIDER CAROUSEL


    // !SLIDER ON CLICK
    // slidesShow(slideIndex);

    // // Вывод slideTotal на страницу
    // if(slides.length < 10) {
    //     slideTotal.textContent = `0${slides.length}`;
    // } else {
    //     slideTotal.textContent = slides.length;
    // }

    // // Функция Работы со слайдами
    // function slidesShow(index) {

    //     // Спрятать все слайды
    //     slides.forEach(slide => {
    //         slide.style.display = 'none';
    //         slide.classList.add('fade')
    //     });

    //     // Проверка на колтчество слайдов
    //     if(index > slides.length) {
    //         slideIndex = 1;
    //     } else if(index < 1){
    //         slideIndex = slides.length;
    //     }

    //     // Вывод slideCurrent на страницу
    //     if(slideIndex < 10) {
    //         slideCurrent.textContent = `0${slideIndex}`;
    //     } else {
    //         slideCurrent.textContent = slideIndex;
    //     }

    //     // Вывод на страницу ПЕРВЫЙ слайд!
    //     slides[slideIndex - 1].style.display = 'block';
    // }

    // function slidesCalc(index) { slidesShow(slideIndex += index) }

    // sliderPrevArrow.addEventListener('click', () => slidesCalc(-1));
    // sliderNextArrow.addEventListener('click', () => slidesCalc(1));

    // !SLIDER CAROUSEL
    slidesField.style.width = 100 * slides.length + '%';
    slidesField.style.display = 'flex';
    slidesField.style.transition = 'all 0.3s ease 0s';

    slidesWrapper.style.overflow = 'hidden';

    // !: SLIDERS FUNCTION
    // Функция, получения 0;
    function slideGetZero() {
        if(slides.length < 10) {
            slideTotal.textContent = `0${slides.length}`;
            slideCurrent.textContent = `0${slideIndex}`;
        } else {
            slideTotal.textContent = slides.length;
            slideCurrent.textContent = slideIndex;
        }
    }
    slideGetZero();

    // Функция, если элемент активен opacity = 1;
    function slideDotsOpacity() {
        dots.forEach(dot => dot.style.opacity = '0.5');
        dots[slideIndex - 1].style.opacity = 1;
    }

    // Функция, для убирание px у числа, используя RegExp. Раньше использовал slice(). Возвращает только ширину блока(число)
    function slideWidthDeleteWord(width) {
        return +slidesWidth.replace(/\D/g, '');
    }

    sliderNextArrow.addEventListener('click', () => {
        if(offset == slideWidthDeleteWord(slidesWidth) * (slides.length - 1)) {
            offset = 0;
        } else {
            offset += slideWidthDeleteWord(slidesWidth);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if(slideIndex == slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        slideGetZero();
        slideDotsOpacity();
    });

    sliderPrevArrow.addEventListener('click', () => {
        if(offset == 0) {
            offset = slideWidthDeleteWord(slidesWidth) * (slides.length - 1);
        } else {
            offset -= slideWidthDeleteWord(slidesWidth);
        }

        slidesField.style.transform = `translateX(-${offset}px)`;

        if(slideIndex == 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }

        slideGetZero();
        slideDotsOpacity();
    });

    // !SLIDER DOTS
    const dotsBox = document.createElement('ol');
    const dots = [];

    slider.style.position = 'relative';

    dotsBox.classList.add('carousel-indicators');

    slidesWrapper.append(dotsBox); 

    for(let i = 0; i < slides.length; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.classList.add('dot');

        if(i == 0 ) {
            dot.style.opacity = 1;
        }

        dotsBox.append(dot);
        dots.push(dot);
    }

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            const target = e.target;
            const slideTo = target.getAttribute('data-slide-to');

            slideIndex = slideTo;
            offset = +slidesWidth.slice(0, slidesWidth.length - 2) * (slideTo - 1);

            slidesField.style.transform = `translateX(-${offset}px)`;

            slideGetZero();
            slideDotsOpacity();
        }); 
    });
    
    //! Calculator of CALORIES

    const resultCalories = document.querySelector('.calculating__result span');
    let gender = 'female';
    let height, weight, age;
    let ratio = 1.375;

    function calcTotal() {
        if(!gender || !height || !weight || !age || !ratio) {
            resultCalories.textContent = 'Error!';
            return;
        }

        if(gender === 'female') {
            resultCalories.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        } else if(gender === 'male'){
            resultCalories.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }
    }
    calcTotal();

    function getStaticInformation(parentSelector, activeClass) {
        const elements = document.querySelectorAll(`${parentSelector} div`);

        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                const target = e.target;
    
                if(target.getAttribute('data-ratio')) {
                    ratio = +target.getAttribute('data-ratio');
                } else {
                    gender = target.getAttribute('id');
                }
                console.log(ratio, gender);

                elements.forEach(elem => {
                    elem.classList.remove(activeClass);
                });
    
                target.classList.add(activeClass);
    
                calcTotal();
            });
        });
    }
    getStaticInformation('#genders', 'calculating__choose-item_active');
    getStaticInformation('.calculating__choose_big', 'calculating__choose-item_active');

    function getDynamicInformation(selector) {
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {
            switch(input.getAttribute('id')) {
                case 'height':
                    height = +input.value;
                    break;
                case 'weight':
                    weight = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }
            calcTotal();
        });
    }
    getDynamicInformation('#height');
    getDynamicInformation('#weight');
    getDynamicInformation('#age');



});