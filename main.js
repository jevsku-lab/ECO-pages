(function () {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const links = Array.from(document.querySelectorAll("a[href^='#']"))
        .filter(link => link.getAttribute('href') !== '#' && document.getElementById(link.getAttribute('href').slice(1)));

    if (!links.length || prefersReducedMotion) {
        return;
    }

    const header = document.querySelector('.header');
    const getHeaderOffset = () => (header ? header.offsetHeight : 0);
    let animationFrame = null;

    const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

    const animateScroll = (startY, destinationY, duration, onComplete) => {
        const distance = destinationY - startY;
        const startTime = performance.now();

        const step = currentTime => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            const eased = easeOutCubic(progress);
            window.scrollTo(0, startY + distance * eased);

            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            } else if (typeof onComplete === "function") {
                onComplete();
            }
        };

        animationFrame = requestAnimationFrame(step);
    };

    links.forEach(link => {
        link.addEventListener("click", event => {
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (!target) {
                return;
            }

            event.preventDefault();

            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
                animationFrame = null;
            }

            const startY = window.pageYOffset;
            const headerOffset = getHeaderOffset();
            const destinationY = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
            const travel = Math.abs(destinationY - startY);
            const duration = Math.min(1400, Math.max(450, travel * 0.6));

            animateScroll(startY, destinationY, duration, () => {
                target.setAttribute('tabindex', '-1');
                target.focus({ preventScroll: true });
                target.removeAttribute('tabindex');
            });
        });
    });
    })();

    document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('modal-overlay');
    if (!modalOverlay) {
        return;
    }

    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalList = document.getElementById('modal-list');
    const modalPrimaryButton = document.getElementById('modal-primary-button');
    const modalSecondaryButton = document.getElementById('modal-secondary-button');
    const modalIcon = modalOverlay.querySelector('.modal-icon');
    const closeButton = modalOverlay.querySelector('.modal-close');
    const triggers = document.querySelectorAll('.action-trigger');

    if (!triggers.length) {
        return;
    }

    let activeTrigger = null;

    const modalContent = {
        volunteer: {
            icon: '🌱',
            title: 'Как стать волонтёром',
            text: 'Мы ищем людей, которые готовы дарить своё время природе и городу. Вот как присоединиться к команде EcoFuture:',
            list: [
                'Заполните короткую анкету добровольца — расскажите о себе и интересах.',
                'Дождитесь письма или звонка координатора — мы подберём проект под ваши навыки.',
                'Пройдите вводный инструктаж и получите календарь ближайших мероприятий.'
            ],
            primary: { label: 'Заполнить анкету', href: '#contact' },
            secondary: { label: 'Посмотреть события', href: '#actions' }
        },
        donate: {
            icon: '💚',
            title: 'Как сделать пожертвование',
            text: 'Каждый рубль помогает запустить новый экологический проект. Поддержите нас удобным вам способом:',
            list: [
                'Переведите любую сумму на наш расчётный счёт — реквизиты появятся после нажатия.',
                'Подпишитесь на ежемесячную поддержку, чтобы мы планировали долгосрочные программы.',
                'Расскажите друзьям — вместе мы сможем ускорить зелёные изменения.'
            ],
            primary: { label: 'Перейти к пожертвованию', href: '#contact' },
            secondary: { label: 'Узнать о проектах', href: '#about' }
        },
        learn: {
            icon: '✨',
            title: 'Узнайте больше',
            text: 'Мы регулярно делимся новостями, историями и приглашениями на события. Оставайтесь на связи:',
            list: [
                'Подпишитесь на рассылку — раз в неделю отправляем подборку вдохновляющих материалов.',
                'Присоединяйтесь к Telegram-каналу, чтобы не пропустить анонсы мероприятий.',
                'Запишитесь на ближайший мастер-класс по устойчивому образу жизни.'
            ],
            primary: { label: 'Подписаться на новости', href: '#contact' },
            secondary: { label: 'Календарь событий', href: '#actions' }
        }
    };

    const applyButtonState = (button, data) => {
        if (data && data.label) {
            button.textContent = data.label;
            if (data.href) {
                button.dataset.href = data.href;
            } else {
                delete button.dataset.href;
            }
            button.hidden = false;
        } else {
            delete button.dataset.href;
            button.hidden = true;
        }
    };

    const openModal = type => {
        const content = modalContent[type];
        if (!content) {
            return;
        }

        modalTitle.textContent = content.title;
        modalText.textContent = content.text;
        modalIcon.textContent = content.icon || '';

        modalList.innerHTML = '';
        if (Array.isArray(content.list) && content.list.length) {
            content.list.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                modalList.appendChild(li);
            });
            modalList.hidden = false;
        } else {
            modalList.hidden = true;
        }

        applyButtonState(modalPrimaryButton, content.primary);
        applyButtonState(modalSecondaryButton, content.secondary);

        modalOverlay.classList.add('is-visible');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        closeButton.focus();
    };

    const closeModal = () => {
        modalOverlay.classList.remove('is-visible');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        modalList.innerHTML = '';
        if (activeTrigger) {
            activeTrigger.focus();
            activeTrigger = null;
        }
    };

    triggers.forEach(trigger => {
        trigger.addEventListener('click', event => {
            event.preventDefault();
            activeTrigger = trigger;
            openModal(trigger.dataset.modal);
        });
    });

    closeButton.addEventListener('click', closeModal);

    modalOverlay.addEventListener('click', event => {
        if (event.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && modalOverlay.classList.contains('is-visible')) {
            closeModal();
        }
    });

    const handleActionButton = event => {
        const href = event.currentTarget.dataset.href;
        closeModal();
        if (!href) {
            return;
        }

        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        } else {
            window.open(href, '_blank');
        }
    };

    modalPrimaryButton.addEventListener('click', handleActionButton);
    modalSecondaryButton.addEventListener('click', handleActionButton);
    });

