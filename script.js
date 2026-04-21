window.onload = function () {
  setTimeout(() => {
    const boot = document.getElementById('boot-screen');
    const desktop = document.getElementById('desktop');

    if (boot) {
      boot.style.opacity = '0';
      setTimeout(() => {
        boot.style.display = 'none';
      }, 500);
    }

    if (desktop) {
      desktop.style.display = 'block';
    }
  }, 2000);
};

let zIndexCounter = 100;

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.style.display = 'flex';
  focusWindow(win);
  resetWindowPosition(win);

  requestAnimationFrame(() => {
    win.classList.add('active');
  });
}

function closeWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;

  win.classList.remove('active');
  setTimeout(() => {
    win.style.display = 'none';
  }, 200);
}

function focusWindow(win) {
  if (!win) return;
  zIndexCounter += 1;
  win.style.zIndex = zIndexCounter;
}

function resetWindowPosition(win) {
  if (!win) return;

  if (window.innerWidth <= 768) {
    win.style.top = '16px';
    win.style.left = '16px';
    win.style.right = '16px';
    win.style.bottom = '16px';
    win.style.width = 'auto';
    win.style.transform = 'none';
  } else {
    win.style.top = '50%';
    win.style.left = '50%';
    win.style.right = 'auto';
    win.style.bottom = 'auto';
    win.style.width = '';
    win.style.transform = 'translate(-50%, -50%)';
  }
}

function enableDragging() {
  document.querySelectorAll('.title-bar').forEach((bar) => {
    bar.addEventListener('mousedown', function (e) {
      if (window.innerWidth <= 768) return;

      const win = bar.parentElement;
      if (!win) return;

      focusWindow(win);

      const rect = win.getBoundingClientRect();
      const shiftX = e.clientX - rect.left;
      const shiftY = e.clientY - rect.top;

      win.classList.add('dragging');
      win.style.transform = 'none';
      win.style.right = 'auto';
      win.style.bottom = 'auto';

      function moveAt(pageX, pageY) {
        win.style.left = `${pageX - shiftX}px`;
        win.style.top = `${pageY - shiftY}px`;
      }

      moveAt(e.pageX, e.pageY);

      function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
      }

      function stopDrag() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', stopDrag);
        win.classList.remove('dragging');
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', stopDrag);
    });
  });
}

enableDragging();

window.addEventListener('resize', () => {
  document.querySelectorAll('.window').forEach((win) => {
    if (win.style.display === 'flex') {
      resetWindowPosition(win);
    }
  });
});
