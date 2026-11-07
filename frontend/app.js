/**
 * CYBER // PC Telemetry HUD - Frontend Application Logic
 * Real-time WebSocket consumer, reactive UI data binding, Chart.js network visualization,
 * and system control dispatchers.
 */

(function () {
  'use strict';

  // State Management
  let socket = null;
  let reconnectAttempts = 0;
  let maxReconnectDelay = 10000;
  let heartbeatTimer = null;
  let isUserInteractingWithVolume = false;
  let volumeDebounceTimer = null;
  let networkChart = null;

  // DOM Elements
  const el = {
    hostName: document.getElementById('host-name'),
    hostIp: document.getElementById('host-ip'),
    hostOs: document.getElementById('host-os'),
    systemUptime: document.getElementById('system-uptime'),
    connBadge: document.getElementById('conn-badge'),
    connText: document.getElementById('conn-text'),

    // Active Game & Session Tracker
    gameSessionCard: document.getElementById('game-session-card'),
    gameActiveContainer: document.getElementById('game-active-container'),
    gameIdleContainer: document.getElementById('game-idle-container'),
    gameTitle: document.getElementById('game-title'),
    gameProcessBadge: document.getElementById('game-process-badge'),
    gameFgBadge: document.getElementById('game-fg-badge'),
    gameSessionTime: document.getElementById('game-session-time'),
    gameIdleText: document.getElementById('game-idle-text'),
    gameLastSessionContainer: document.getElementById('game-last-session-container'),
    gameLastSessionText: document.getElementById('game-last-session-text'),

    // Power Alert Banner
    powerAlertBanner: document.getElementById('power-alert-banner'),
    powerAlertText: document.getElementById('power-alert-text'),
    btnCancelPowerBanner: document.getElementById('btn-cancel-power-banner'),

    // CPU
    cpuRadial: document.getElementById('cpu-radial'),
    cpuLoadNum: document.getElementById('cpu-load-num'),
    cpuFreqText: document.getElementById('cpu-freq-text'),
    cpuCoresText: document.getElementById('cpu-cores-text'),
    cpuTempBadge: document.getElementById('cpu-temp-badge'),
    cpuThreadCount: document.getElementById('cpu-thread-count'),
    cpuCoreGrid: document.getElementById('cpu-core-grid'),

    // GPU
    gpuName: document.getElementById('gpu-name'),
    gpuSourceBadge: document.getElementById('gpu-source-badge'),
    gpuEmptyState: document.getElementById('gpu-empty-state'),
    gpuActiveState: document.getElementById('gpu-active-state'),
    gpuRadial: document.getElementById('gpu-radial'),
    gpuLoadNum: document.getElementById('gpu-load-num'),
    gpuTempText: document.getElementById('gpu-temp-text'),
    gpuFanText: document.getElementById('gpu-fan-text'),
    gpuPowerText: document.getElementById('gpu-power-text'),
    gpuVramText: document.getElementById('gpu-vram-text'),
    gpuVramBar: document.getElementById('gpu-vram-bar'),

    // Memory
    ramPercentBadge: document.getElementById('ram-percent-badge'),
    ramUsedText: document.getElementById('ram-used-text'),
    ramBar: document.getElementById('ram-bar'),
    swapUsedText: document.getElementById('swap-used-text'),
    swapBar: document.getElementById('swap-bar'),
    ramAvailText: document.getElementById('ram-avail-text'),
    ramCommitText: document.getElementById('ram-commit-text'),

    // Network
    netDownRate: document.getElementById('net-down-rate'),
    netUpRate: document.getElementById('net-up-rate'),
    netTotalRecv: document.getElementById('net-total-recv'),
    netTotalSent: document.getElementById('net-total-sent'),

    // Disks
    diskCountBadge: document.getElementById('disk-count-badge'),
    diskListContainer: document.getElementById('disk-list-container'),

    // Audio
    btnToggleMute: document.getElementById('btn-toggle-mute'),
    muteIcon: document.getElementById('mute-icon'),
    muteLabel: document.getElementById('mute-label'),
    audioSlider: document.getElementById('audio-slider'),
    volumeValText: document.getElementById('volume-val-text'),
    volPresetBtns: document.querySelectorAll('.vol-preset-btn'),

    // Power Actions
    btnTriggerSleep: document.getElementById('btn-trigger-sleep'),
    btnTriggerShutdown: document.getElementById('btn-trigger-shutdown'),

    // Modal
    powerConfirmModal: document.getElementById('power-confirm-modal'),
    modalTitle: document.getElementById('modal-title'),
    modalDesc: document.getElementById('modal-desc'),
    modalCountdownNum: document.getElementById('modal-countdown-num'),
    modalCountdownBar: document.getElementById('modal-countdown-bar'),
    btnModalCancel: document.getElementById('btn-modal-cancel'),
    btnModalConfirm: document.getElementById('btn-modal-confirm'),

    // Remote Desktop & Tabs
    tabBtnTelemetry: document.getElementById('tab-btn-telemetry'),
    tabBtnRemote: document.getElementById('tab-btn-remote'),
    telemetryView: document.getElementById('telemetry-view'),
    remoteView: document.getElementById('remote-view'),
    remoteVideo: document.getElementById('remoteVideo'),
    remoteAudio: document.getElementById('remoteAudio'),
    videoContainer: document.getElementById('videoContainer'),
    audioAutoplayOverlay: document.getElementById('audioAutoplayOverlay'),
    btnStartStream: document.getElementById('btn-start-stream'),
    btnToggleKeyboard: document.getElementById('btn-toggle-keyboard'),
    virtualKeyboardInput: document.getElementById('virtualKeyboardInput'),
    btnToggleFullscreen: document.getElementById('btn-toggle-fullscreen'),
    btnRestartStream: document.getElementById('btn-restart-stream'),
    rtcStateBadge: document.getElementById('rtc-state-badge'),
    encoderBadge: document.getElementById('encoder-badge'),
    quickKeyBtns: document.querySelectorAll('.quick-key-btn'),

    // Top Navigation & Host Switching
    btnSwitchServer: document.getElementById('btnSwitchServer'),

    // Keep-Awake Screen Wake Lock
    btnKeepAwake: document.getElementById('btnKeepAwake'),
    wakeLockIcon: document.getElementById('wakeLockIcon'),
    wakeLockText: document.getElementById('wakeLockText'),

    // Device Pairing & Auth Elements
    authShieldBadge: document.getElementById('auth-shield-badge'),
    authStatusText: document.getElementById('authStatusText'),
    btnUnpairDevice: document.getElementById('btnUnpairDevice'),
    pairingModal: document.getElementById('pairingModal'),
    pairingHostBadge: document.getElementById('pairingHostBadge'),
    pairingForm: document.getElementById('pairingForm'),
    pinInputGroup: document.getElementById('pinInputGroup'),
    pinDigitBoxes: document.querySelectorAll('.pin-digit-box'),
    pinTimerNum: document.getElementById('pinTimerNum'),
    btnRequestNewPin: document.getElementById('btnRequestNewPin'),
    pinErrorBox: document.getElementById('pinErrorBox'),
    pinErrorText: document.getElementById('pinErrorText'),
    btnSubmitPin: document.getElementById('btnSubmitPin'),
    btnCancelPairing: document.getElementById('btnCancelPairing'),

    // Security Gatekeeper Elements
    securityGatekeeperCard: document.getElementById('security-gatekeeper-card'),
    btnToggleAllowDevices: document.getElementById('btn-toggle-allow-devices'),
    secToggleKnob: document.getElementById('sec-toggle-knob'),
    secStatusBadge: document.getElementById('sec-status-badge'),
    secToggleDesc: document.getElementById('sec-toggle-desc'),
    secLabelNo: document.getElementById('sec-label-no'),
    secLabelYes: document.getElementById('sec-label-yes'),
    secPairedCount: document.getElementById('sec-paired-count'),
    secRemoteNotice: document.getElementById('sec-remote-notice'),
    secCardIconContainer: document.getElementById('sec-card-icon-container'),
    secCardIcon: document.getElementById('sec-card-icon'),
    btnUnpairAll: document.getElementById('btn-unpair-all'),
    btnHeaderEnablePairing: document.getElementById('btnHeaderEnablePairing'),
    headerPairingIcon: document.getElementById('headerPairingIcon'),
    headerPairingText: document.getElementById('headerPairingText'),

    // Dual-view Pairing Modal Elements
    pairingLockedView: document.getElementById('pairingLockedView'),
    pairingLockedHostBadge: document.getElementById('pairingLockedHostBadge'),
    btnCheckPairingAgain: document.getElementById('btnCheckPairingAgain'),
    btnCheckPairingAgainIcon: document.getElementById('btnCheckPairingAgainIcon'),
    btnLockedSwitchPc: document.getElementById('btnLockedSwitchPc'),
    pairingPinView: document.getElementById('pairingPinView'),

    // Matrix (Multi-PC) Navigation & Grid
    tabBtnMatrix: document.getElementById('tab-btn-matrix'),
    matrixHostCountBadge: document.getElementById('matrixHostCountBadge'),
    matrixView: document.getElementById('matrix-view'),
    matrixGrid: document.getElementById('matrix-grid'),
    btnMatrixScan: document.getElementById('btnMatrixScan'),
    matrixScanIcon: document.getElementById('matrixScanIcon'),
    matrixPollingRateText: document.getElementById('matrixPollingRateText'),

    // Host Not Found / Offline Overlay
    offlineOverlay: document.getElementById('offlineOverlay'),
    offlineHostTarget: document.getElementById('offlineHostTarget'),
    offlineStateDetail: document.getElementById('offlineStateDetail'),
    offlineRetryCountdown: document.getElementById('offlineRetryCountdown'),
    btnOfflineRetry: document.getElementById('btnOfflineRetry'),
    btnOfflineScan: document.getElementById('btnOfflineScan'),
    offlineRetryIcon: document.getElementById('offlineRetryIcon'),
    offlineRetryBtnText: document.getElementById('offlineRetryBtnText'),

    // LAN Host Discovery Overlay & Controls
    discoveryOverlay: document.getElementById('discoveryOverlay'),
    btnCloseDiscovery: document.getElementById('btnCloseDiscovery'),
    discoveryTitle: document.getElementById('discoveryTitle'),
    discoverySubtitle: document.getElementById('discoverySubtitle'),
    discoveredHostsList: document.getElementById('discoveredHostsList'),
    manualConnectForm: document.getElementById('manualConnectForm'),
    inputManualHost: document.getElementById('inputManualHost'),
    btnManualConnect: document.getElementById('btnManualConnect'),
    btnRescanHosts: document.getElementById('btnRescanHosts'),
    rescanIcon: document.getElementById('rescanIcon'),
    discoveryCountLabel: document.getElementById('discoveryCountLabel'),
  };

  // Connection Watchdog & State Machine
  let connectionWatchdogTimer = null;
  let retryCountdownTimer = null;
  let retryCountdownSeconds = 0;
  let isOfflineOverlayVisible = false;

  // WebRTC & Remote Stream State
  let rtcPeerConnection = null;
  let rtcDataChannel = null;
  let isWebRTCActive = false;
  let currentActiveTab = 'telemetry';

  const RADIAL_CIRCUMFERENCE = 251.2; // 2 * PI * 40

  // -------------------------------------------------------------------------
  // Initialize Chart.js Network Graph
  // -------------------------------------------------------------------------
  function initNetworkChart() {
    const ctx = document.getElementById('networkChart').getContext('2d');

    // Gradient fills
    const cyanGrad = ctx.createLinearGradient(0, 0, 0, 160);
    cyanGrad.addColorStop(0, 'rgba(6, 182, 212, 0.35)');
    cyanGrad.addColorStop(1, 'rgba(6, 182, 212, 0.0)');

    const violetGrad = ctx.createLinearGradient(0, 0, 0, 160);
    violetGrad.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
    violetGrad.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    networkChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Array(30).fill(''),
        datasets: [
          {
            label: 'Download (KB/s)',
            data: Array(30).fill(0),
            borderColor: '#06b6d4',
            backgroundColor: cyanGrad,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3,
            fill: true,
          },
          {
            label: 'Upload (KB/s)',
            data: Array(30).fill(0),
            borderColor: '#8b5cf6',
            backgroundColor: violetGrad,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3,
            fill: true,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 300,
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0f172a',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderWidth: 1,
            titleColor: '#94a3b8',
            bodyColor: '#f1f5f9',
            padding: 8,
            displayColors: true,
          }
        },
        scales: {
          x: {
            display: false,
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            suggestedMax: 100,
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
            },
            ticks: {
              color: '#64748b',
              font: { size: 9, family: 'monospace' },
              callback: function (val) {
                if (val >= 1024) return (val / 1024).toFixed(1) + 'M';
                return val.toFixed(0) + 'K';
              }
            }
          }
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Radial Gauge Helper
  // -------------------------------------------------------------------------
  function setRadialProgress(circleElement, percent, colorClass) {
    if (!circleElement) return;
    const clamped = Math.max(0, Math.min(100, percent));
    const offset = RADIAL_CIRCUMFERENCE * (1 - clamped / 100);
    circleElement.style.strokeDashoffset = offset;
  }

  // -------------------------------------------------------------------------
  // Host Configuration & Dynamic Target Routing
  // -------------------------------------------------------------------------
  const STORAGE_KEY_HOST = 'hud_selected_host';

  function getSavedHost() {
    return localStorage.getItem(STORAGE_KEY_HOST) || null;
  }

  function setSavedHost(host) {
    if (host) {
      localStorage.setItem(STORAGE_KEY_HOST, host);
    }
  }

  function clearSavedHost() {
    localStorage.removeItem(STORAGE_KEY_HOST);
  }

  function getTargetHost() {
    const saved = getSavedHost();
    if (saved) return saved;

    const locHost = window.location.host;
    if (locHost && !locHost.startsWith('localhost') && !locHost.startsWith('127.0.0.1')) {
      return locHost;
    }

    return locHost || '127.0.0.1:8080';
  }

  function getHttpBase() {
    const host = getTargetHost();
    const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${proto}//${host}`;
  }

  function getApiUrl(path) {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${getHttpBase()}${cleanPath}`;
  }

  function getWebSocketUrl() {
    const host = getTargetHost();
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${proto}//${host}/ws`;
  }

  // -------------------------------------------------------------------------
  // Device Identity & Authentication Token Management
  // -------------------------------------------------------------------------
  const STORAGE_KEY_DEVICE_ID = 'hud_device_id';

  function getDeviceId() {
    let devId = localStorage.getItem(STORAGE_KEY_DEVICE_ID);
    if (!devId) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        devId = crypto.randomUUID();
      } else {
        devId = 'hud-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
      }
      localStorage.setItem(STORAGE_KEY_DEVICE_ID, devId);
    }
    return devId;
  }

  function getDeviceName() {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android Device (HUD)';
    if (/iphone|ipad|ipod/i.test(ua)) return 'Apple iOS (HUD)';
    if (/macintosh|mac os x/i.test(ua)) return 'macOS Client';
    if (/windows/i.test(ua)) return 'Windows Client';
    if (/linux/i.test(ua)) return 'Linux Client';
    return 'Mobile Browser Client';
  }

  function getAuthTokenKey(host) {
    const target = host || getTargetHost();
    return `hud_auth_token_${target.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  function getAuthToken(host) {
    return localStorage.getItem(getAuthTokenKey(host)) || null;
  }

  function setAuthToken(token, host) {
    if (token) {
      localStorage.setItem(getAuthTokenKey(host), token);
    }
  }

  function clearAuthToken(host) {
    localStorage.removeItem(getAuthTokenKey(host));
  }

  function getAuthHeaders(host) {
    const token = getAuthToken(host);
    const headers = { 'Accept': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  function updateAuthShieldUI(isAuthenticated) {
    if (!el.authShieldBadge) return;
    if (isAuthenticated) {
      el.authShieldBadge.classList.remove('hidden');
      if (el.btnUnpairDevice) el.btnUnpairDevice.classList.remove('hidden');
    } else {
      el.authShieldBadge.classList.add('hidden');
      if (el.btnUnpairDevice) el.btnUnpairDevice.classList.add('hidden');
    }
  }

  async function checkAuthStatus(host) {
    const target = host || getTargetHost();
    const token = getAuthToken(target);
    if (!token) {
      updateAuthShieldUI(false);
      return false;
    }
    try {
      const res = await fetch(getApiUrl('/api/auth/status'), {
        headers: getAuthHeaders(target)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          updateAuthShieldUI(true);
          return true;
        }
      }
    } catch (_) {}
    updateAuthShieldUI(false);
    return false;
  }

  // -------------------------------------------------------------------------
  // Device Pairing & Authentication Lock Modal Controller
  // -------------------------------------------------------------------------
  const AuthModal = {
    targetHost: null,
    countdownInterval: null,
    pollLockedInterval: null,
    remainingSeconds: 60,

    async show(targetHost) {
      this.targetHost = targetHost || getTargetHost();
      if (!el.pairingModal) return;

      if (el.pairingHostBadge) {
        el.pairingHostBadge.textContent = this.targetHost;
      }
      if (el.pairingLockedHostBadge) {
        el.pairingLockedHostBadge.textContent = this.targetHost;
      }

      this.clearInputs();
      this.clearError();
      el.pairingModal.classList.remove('hidden');

      // Check whether new device connections are allowed on the target host
      await this.checkGateAndDisplay();

      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    },

    async checkGateAndDisplay() {
      const host = this.targetHost || getTargetHost();
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
      let isAllowed = false;

      try {
        const res = await fetch(`${proto}//${host}/api/security/status`, {
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          isAllowed = !!data.allow_new_devices;
        }
      } catch (err) {
        console.warn('[AuthModal] Could not fetch security status:', err);
      }

      if (!isAllowed) {
        // Show Locked View
        this.showLockedView();
      } else {
        // Show PIN View
        this.showPinView();
      }
    },

    showLockedView() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      if (el.pairingLockedView) el.pairingLockedView.classList.remove('hidden');
      if (el.pairingPinView) el.pairingPinView.classList.add('hidden');

      // Auto-poll every 3.5s to see if host flipped switch to "ДА"
      if (!this.pollLockedInterval) {
        this.pollLockedInterval = setInterval(async () => {
          if (!el.pairingModal || el.pairingModal.classList.contains('hidden')) {
            clearInterval(this.pollLockedInterval);
            this.pollLockedInterval = null;
            return;
          }
          const host = this.targetHost || getTargetHost();
          const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
          try {
            const res = await fetch(`${proto}//${host}/api/security/status`);
            if (res.ok) {
              const data = await res.json();
              if (data.allow_new_devices) {
                console.log('[AuthModal] Host enabled pairing! Switching to PIN view.');
                clearInterval(this.pollLockedInterval);
                this.pollLockedInterval = null;
                this.showPinView();
              }
            }
          } catch (_) {}
        }, 3500);
      }
    },

    showPinView() {
      if (this.pollLockedInterval) {
        clearInterval(this.pollLockedInterval);
        this.pollLockedInterval = null;
      }
      if (el.pairingLockedView) el.pairingLockedView.classList.add('hidden');
      if (el.pairingPinView) el.pairingPinView.classList.remove('hidden');

      if (el.pinDigitBoxes && el.pinDigitBoxes.length > 0) {
        setTimeout(() => el.pinDigitBoxes[0].focus(), 120);
      }

      this.requestPin();
      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    },

    hide() {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
        this.countdownInterval = null;
      }
      if (this.pollLockedInterval) {
        clearInterval(this.pollLockedInterval);
        this.pollLockedInterval = null;
      }
      if (el.pairingModal) {
        el.pairingModal.classList.add('hidden');
      }
    },

    clearInputs() {
      if (!el.pinDigitBoxes) return;
      el.pinDigitBoxes.forEach((box) => {
        box.value = '';
        box.classList.remove('filled', 'error');
      });
    },

    showError(msg) {
      if (el.pinErrorBox && el.pinErrorText) {
        el.pinErrorText.textContent = msg || 'Invalid PIN. Please try again.';
        el.pinErrorBox.classList.remove('hidden');
      }
      if (el.pinInputGroup) {
        el.pinInputGroup.classList.remove('pin-shake');
        void el.pinInputGroup.offsetWidth;
        el.pinInputGroup.classList.add('pin-shake');
      }
      if (el.pinDigitBoxes) {
        el.pinDigitBoxes.forEach(b => b.classList.add('error'));
      }
    },

    clearError() {
      if (el.pinErrorBox) el.pinErrorBox.classList.add('hidden');
      if (el.pinDigitBoxes) {
        el.pinDigitBoxes.forEach(b => b.classList.remove('error'));
      }
    },

    async requestPin() {
      const host = this.targetHost || getTargetHost();
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
      try {
        const res = await fetch(`${proto}//${host}/api/auth/request-pin`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          this.clearError();
          this.startCountdown(data.expires_in || 60);
        } else if (res.status === 403) {
          const errData = await res.json().catch(() => ({}));
          const errCode = (errData.detail && errData.detail.error) || errData.error;
          if (errCode === 'pairing_disabled') {
            this.showLockedView();
            return;
          }
          const msg = (errData.detail && errData.detail.message) || errData.detail || "Новые подключения отключены на хосте";
          this.showError(msg);
          if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
          }
          if (el.pinTimerNum) el.pinTimerNum.textContent = "LOCKED";
        } else {
          this.startCountdown(60);
        }
      } catch (e) {
        console.warn('[AuthModal] Could not trigger PIN request:', e);
        this.startCountdown(60);
      }
    },

    async enableHostPairing() {
      const host = this.targetHost || getTargetHost();
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
      try {
        const res = await fetch(`${proto}//${host}/api/auth/enable-pairing`, {
          method: 'POST',
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          this.clearError();
          if (typeof SecurityGatekeeper !== 'undefined' && SecurityGatekeeper.fetchStatus) {
            SecurityGatekeeper.fetchStatus();
          }
          this.showPinView();
          this.startCountdown(data.expires_in || 60);
          if (el.pinDigitBoxes && el.pinDigitBoxes.length > 0) {
            el.pinDigitBoxes[0].focus();
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          this.showError(errData.detail || 'Pairing can only be enabled directly on the host PC.');
        }
      } catch (err) {
        this.showError('Could not communicate with host PC to enable pairing.');
      }
    },

    startCountdown(seconds) {
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval);
      }
      this.remainingSeconds = seconds || 60;
      if (el.pinTimerNum) el.pinTimerNum.textContent = `${this.remainingSeconds}s`;

      this.countdownInterval = setInterval(() => {
        this.remainingSeconds--;
        if (this.remainingSeconds <= 0) {
          clearInterval(this.countdownInterval);
          this.countdownInterval = null;
          if (el.pinTimerNum) el.pinTimerNum.textContent = 'Expired';
          this.showError('PIN has expired. Tap "Request New PIN" to display a fresh code on your PC.');
        } else {
          if (el.pinTimerNum) el.pinTimerNum.textContent = `${this.remainingSeconds}s`;
        }
      }, 1000);
    },

    async submitPIN() {
      if (!el.pinDigitBoxes) return;
      const digits = Array.from(el.pinDigitBoxes).map(b => b.value.trim()).join('');
      if (digits.length !== 6) {
        this.showError('Please enter the full 6-digit PIN.');
        return;
      }

      this.clearError();
      const host = this.targetHost || getTargetHost();
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';

      if (el.btnSubmitPin) {
        el.btnSubmitPin.disabled = true;
        el.btnSubmitPin.classList.add('opacity-75');
      }

      try {
        const res = await fetch(`${proto}//${host}/api/auth/pair`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            pin: digits,
            device_id: getDeviceId(),
            device_name: getDeviceName()
          })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          console.log('[Auth] Device successfully paired and token issued.');
          setAuthToken(data.token, host);
          this.hide();
          updateAuthShieldUI(true);

          if (host === getTargetHost()) {
            connectWebSocket(true);
            fetchServerStatus();
          }

          if (typeof MatrixEngine !== 'undefined' && MatrixEngine.pollAll) {
            MatrixEngine.pollAll();
          }
        } else {
          this.showError(data.detail || 'Pairing failed. Incorrect PIN.');
          this.clearInputs();
          if (el.pinDigitBoxes && el.pinDigitBoxes.length > 0) {
            el.pinDigitBoxes[0].focus();
          }
        }
      } catch (err) {
        console.error('[AuthModal] Network error during pairing:', err);
        this.showError('Connection error. Ensure PC server is reachable.');
      } finally {
        if (el.btnSubmitPin) {
          el.btnSubmitPin.disabled = false;
          el.btnSubmitPin.classList.remove('opacity-75');
        }
      }
    }
  };

  // -------------------------------------------------------------------------
  // Host Security Gatekeeper Controller ("Разрешить подключение новых устройств")
  // -------------------------------------------------------------------------
  const SecurityGatekeeper = {
    allowNewDevices: false,
    pairedDevicesCount: 0,
    isLocalhost: false,

    async init() {
      await this.fetchStatus();
      this.bindEvents();
    },

    async fetchStatus(host) {
      const target = host || getTargetHost();
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
      try {
        const res = await fetch(`${proto}//${target}/api/security/status`, {
          headers: getAuthHeaders(target)
        });
        if (res.ok) {
          const data = await res.json();
          this.allowNewDevices = !!data.allow_new_devices;
          this.pairedDevicesCount = data.paired_devices_count || 0;
          this.isLocalhost = !!data.is_localhost;
          this.updateUI();
          return data;
        }
      } catch (e) {
        console.warn('[SecurityGatekeeper] Failed to fetch status:', e);
      }
      return null;
    },

    updateUI() {
      // 1. Update Card Toggle Switch
      if (el.btnToggleAllowDevices) {
        el.btnToggleAllowDevices.setAttribute('aria-checked', String(this.allowNewDevices));
        if (this.allowNewDevices) {
          el.btnToggleAllowDevices.classList.remove('sec-switch-off');
          el.btnToggleAllowDevices.classList.add('sec-switch-on');
        } else {
          el.btnToggleAllowDevices.classList.remove('sec-switch-on');
          el.btnToggleAllowDevices.classList.add('sec-switch-off');
        }
      }

      // 2. Status Badge ("ДА" vs "НЕТ")
      if (el.secStatusBadge) {
        if (this.allowNewDevices) {
          el.secStatusBadge.textContent = 'ДА';
          el.secStatusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider transition-all duration-300 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 box-glow-emerald';
        } else {
          el.secStatusBadge.textContent = 'НЕТ';
          el.secStatusBadge.className = 'px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wider transition-all duration-300 bg-rose-950/80 border border-rose-500/50 text-rose-300';
        }
      }

      // 3. Status Description
      if (el.secToggleDesc) {
        if (this.allowNewDevices) {
          el.secToggleDesc.textContent = 'Режим ожидания подключения: новые устройства могут запросить 6-значный PIN-код.';
          el.secToggleDesc.className = 'text-xs text-emerald-300/90 leading-relaxed font-sans transition-colors duration-300';
        } else {
          el.secToggleDesc.textContent = 'Новые устройства не могут подключиться. Окна с кодами на ПК заблокированы.';
          el.secToggleDesc.className = 'text-xs text-slate-400 leading-relaxed font-sans transition-colors duration-300';
        }
      }

      // 4. Labels "НЕТ" and "ДА"
      if (el.secLabelNo && el.secLabelYes) {
        if (this.allowNewDevices) {
          el.secLabelNo.className = 'text-xs font-bold font-mono text-slate-500 transition-colors';
          el.secLabelYes.className = 'text-xs font-bold font-mono text-emerald-400 transition-colors';
        } else {
          el.secLabelNo.className = 'text-xs font-bold font-mono text-rose-400 transition-colors';
          el.secLabelYes.className = 'text-xs font-bold font-mono text-slate-500 transition-colors';
        }
      }

      // 5. Card Icon Container
      if (el.secCardIconContainer && el.secCardIcon) {
        if (this.allowNewDevices) {
          el.secCardIconContainer.className = 'w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 box-glow-emerald transition-colors duration-300';
          el.secCardIcon.setAttribute('data-lucide', 'shield-check');
        } else {
          el.secCardIconContainer.className = 'w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-rose-400 transition-colors duration-300';
          el.secCardIcon.setAttribute('data-lucide', 'shield-alert');
        }
      }

      // 6. Header Button Sync ("Сопряжение: ДА" vs "Сопряжение: НЕТ")
      if (el.headerPairingText && el.btnHeaderEnablePairing) {
        if (this.allowNewDevices) {
          el.headerPairingText.textContent = 'Сопряжение: ДА';
          el.btnHeaderEnablePairing.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/50 text-emerald-300 transition shadow-sm active:scale-95 cursor-pointer box-glow-emerald';
          if (el.headerPairingIcon) el.headerPairingIcon.setAttribute('data-lucide', 'unlock');
        } else {
          el.headerPairingText.textContent = 'Сопряжение: НЕТ';
          el.btnHeaderEnablePairing.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 transition shadow-sm active:scale-95 cursor-pointer';
          if (el.headerPairingIcon) el.headerPairingIcon.setAttribute('data-lucide', 'shield');
        }
      }

      // 7. Paired Devices Count
      if (el.secPairedCount) {
        el.secPairedCount.textContent = String(this.pairedDevicesCount);
      }

      // 8. Localhost Restrictions
      if (el.secRemoteNotice) {
        if (!this.isLocalhost) {
          el.secRemoteNotice.classList.remove('hidden');
          if (el.btnToggleAllowDevices) {
            el.btnToggleAllowDevices.classList.add('opacity-60', 'cursor-not-allowed');
            el.btnToggleAllowDevices.classList.remove('cursor-pointer');
          }
        } else {
          el.secRemoteNotice.classList.add('hidden');
          if (el.btnToggleAllowDevices) {
            el.btnToggleAllowDevices.classList.remove('opacity-60', 'cursor-not-allowed');
            el.btnToggleAllowDevices.classList.add('cursor-pointer');
          }
        }
      }

      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    },

    async toggle() {
      if (!this.isLocalhost) {
        alert('Управлять переключателем можно только с самого компьютера (localhost).');
        return;
      }

      const targetNewState = !this.allowNewDevices;
      const target = getTargetHost();
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';

      try {
        const res = await fetch(`${proto}//${target}/api/security/toggle-new-devices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...getAuthHeaders(target)
          },
          body: JSON.stringify({ allow: targetNewState })
        });

        if (res.ok) {
          const data = await res.json();
          this.allowNewDevices = !!data.allow_new_devices;
          this.pairedDevicesCount = data.paired_devices_count ?? this.pairedDevicesCount;
          this.updateUI();
          console.log(`[SecurityGatekeeper] Toggled to: ${this.allowNewDevices ? 'ДА' : 'НЕТ'}`);
        } else {
          const errData = await res.json().catch(() => ({}));
          alert(errData.detail || 'Не удалось переключить режим сопряжения.');
        }
      } catch (e) {
        console.error('[SecurityGatekeeper] Toggle error:', e);
        alert('Ошибка связи с хостом.');
      }
    },

    bindEvents() {
      if (el.btnToggleAllowDevices) {
        el.btnToggleAllowDevices.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
      }

      if (el.btnUnpairAll) {
        el.btnUnpairAll.addEventListener('click', async (e) => {
          e.preventDefault();
          if (!confirm('Вы уверены, что хотите сбросить все сопряжения устройств? Все ранее подключенные телефоны потеряют доступ.')) {
            return;
          }
          const target = getTargetHost();
          const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
          try {
            await fetch(`${proto}//${target}/api/auth/unpair`, {
              method: 'POST',
              headers: getAuthHeaders(target)
            });
            clearAuthToken(target);
            updateAuthShieldUI(false);
            await this.fetchStatus();
            alert('Все сопряжения сброшены.');
          } catch (err) {
            console.error('Failed to unpair devices:', err);
          }
        });
      }
    }
  };

  // -------------------------------------------------------------------------
  // Device Pairing Input & Modal Event Handlers
  // -------------------------------------------------------------------------
  if (el.pinDigitBoxes && el.pinDigitBoxes.length > 0) {
    el.pinDigitBoxes.forEach((box, index) => {
      box.addEventListener('input', (e) => {
        AuthModal.clearError();
        const val = e.target.value.replace(/\D/g, '');
        if (val) {
          box.value = val.slice(-1);
          box.classList.add('filled');
          if (index < el.pinDigitBoxes.length - 1) {
            el.pinDigitBoxes[index + 1].focus();
          } else {
            const fullCode = Array.from(el.pinDigitBoxes).map(b => b.value).join('');
            if (fullCode.length === 6) {
              AuthModal.submitPIN();
            }
          }
        } else {
          box.value = '';
          box.classList.remove('filled');
        }
      });

      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
          if (!box.value && index > 0) {
            el.pinDigitBoxes[index - 1].focus();
            el.pinDigitBoxes[index - 1].value = '';
            el.pinDigitBoxes[index - 1].classList.remove('filled');
          } else {
            box.value = '';
            box.classList.remove('filled');
          }
        } else if (e.key === 'ArrowLeft' && index > 0) {
          el.pinDigitBoxes[index - 1].focus();
        } else if (e.key === 'ArrowRight' && index < el.pinDigitBoxes.length - 1) {
          el.pinDigitBoxes[index + 1].focus();
        }
      });

      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text') || '';
        const clean = text.replace(/\D/g, '').slice(0, 6);
        if (clean.length > 0) {
          for (let i = 0; i < el.pinDigitBoxes.length; i++) {
            if (i < clean.length) {
              el.pinDigitBoxes[i].value = clean[i];
              el.pinDigitBoxes[i].classList.add('filled');
            } else {
              el.pinDigitBoxes[i].value = '';
              el.pinDigitBoxes[i].classList.remove('filled');
            }
          }
          if (clean.length === 6) {
            AuthModal.submitPIN();
          } else if (clean.length < el.pinDigitBoxes.length) {
            el.pinDigitBoxes[clean.length].focus();
          }
        }
      });
    });
  }

  if (el.pairingForm) {
    el.pairingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      AuthModal.submitPIN();
    });
  }

  if (el.btnRequestNewPin) {
    el.btnRequestNewPin.addEventListener('click', (e) => {
      e.preventDefault();
      AuthModal.clearInputs();
      AuthModal.clearError();
      AuthModal.requestPin();
      if (el.pinDigitBoxes && el.pinDigitBoxes.length > 0) {
        el.pinDigitBoxes[0].focus();
      }
    });
  }

  const btnHostEnablePairing = document.getElementById('btnHostEnablePairing');
  if (btnHostEnablePairing) {
    btnHostEnablePairing.addEventListener('click', (e) => {
      e.preventDefault();
      AuthModal.enableHostPairing();
    });
  }

  const btnHeaderEnablePairing = document.getElementById('btnHeaderEnablePairing');
  if (btnHeaderEnablePairing) {
    btnHeaderEnablePairing.addEventListener('click', (e) => {
      e.preventDefault();
      if (SecurityGatekeeper.isLocalhost) {
        SecurityGatekeeper.toggle();
      } else {
        AuthModal.show();
      }
    });
  }

  if (el.btnCheckPairingAgain) {
    el.btnCheckPairingAgain.addEventListener('click', async (e) => {
      e.preventDefault();
      if (el.btnCheckPairingAgainIcon) {
        el.btnCheckPairingAgainIcon.classList.add('animate-spin');
      }
      await AuthModal.checkGateAndDisplay();
      setTimeout(() => {
        if (el.btnCheckPairingAgainIcon) {
          el.btnCheckPairingAgainIcon.classList.remove('animate-spin');
        }
      }, 500);
    });
  }

  if (el.btnLockedSwitchPc) {
    el.btnLockedSwitchPc.addEventListener('click', (e) => {
      e.preventDefault();
      AuthModal.hide();
      DiscoveryEngine.showOverlay(false);
      DiscoveryEngine.startScan(false);
    });
  }

  if (el.btnCancelPairing) {
    el.btnCancelPairing.addEventListener('click', (e) => {
      e.preventDefault();
      AuthModal.hide();
      DiscoveryEngine.showOverlay(false);
      DiscoveryEngine.startScan(false);
    });
  }

  if (el.btnUnpairDevice) {
    el.btnUnpairDevice.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!confirm('Forget / Unpair this PC? You will need to re-enter a 6-digit PIN to access this PC.')) {
        return;
      }
      try {
        await fetch(getApiUrl('/api/auth/unpair'), {
          method: 'POST',
          headers: getAuthHeaders()
        });
      } catch (_) {}
      clearAuthToken();
      updateAuthShieldUI(false);
      closeWebRTC();
      if (socket) {
        try { socket.close(); } catch (_) {}
        socket = null;
      }
      AuthModal.show();
    });
  }

  // -------------------------------------------------------------------------
  // LAN Discovery Engine (Zero-Configuration Mobile Discovery)
  // -------------------------------------------------------------------------
  const DiscoveryEngine = {
    isScanning: false,
    discoveredHosts: new Map(),

    showOverlay(canClose = false) {
      if (!el.discoveryOverlay) return;
      el.discoveryOverlay.classList.remove('hidden');
      if (el.btnCloseDiscovery) {
        if (canClose && socket && socket.readyState === WebSocket.OPEN) {
          el.btnCloseDiscovery.classList.remove('hidden');
        } else {
          el.btnCloseDiscovery.classList.add('hidden');
        }
      }
      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    },

    hideOverlay() {
      if (!el.discoveryOverlay) return;
      el.discoveryOverlay.classList.add('hidden');
    },

    async probeHost(ipPort) {
      try {
        const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
        const url = `${proto}//${ipPort}/api/discovery/info`;
        const res = await fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(1200),
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.type === 'HUD_HOST_OFFER') {
            return data;
          }
        }
      } catch (_) {}
      return null;
    },

    async startScan(autoConnect = true) {
      if (this.isScanning) return;
      this.isScanning = true;
      this.discoveredHosts.clear();
      this.renderHostsList();

      if (el.rescanIcon) el.rescanIcon.classList.add('animate-spin-fast');
      if (el.discoveryTitle) el.discoveryTitle.textContent = 'Scanning for PC HUDs on Wi-Fi...';
      if (el.discoverySubtitle) el.discoverySubtitle.textContent = 'Probing local network adapters & UDP port 8082...';
      if (el.discoveryCountLabel) el.discoveryCountLabel.textContent = 'Scanning subnets...';

      const candidateHosts = new Set();

      // Priority Candidate 1: Saved host
      const saved = getSavedHost();
      if (saved) candidateHosts.add(saved);

      // Priority Candidate 2: Current browser origin host
      const curHost = window.location.host;
      if (curHost && !curHost.startsWith('localhost') && !curHost.startsWith('127.0.0.1')) {
        candidateHosts.add(curHost);
      }
      candidateHosts.add('127.0.0.1:8080');
      candidateHosts.add('localhost:8080');

      // Candidate 3: Subnet sweep candidates
      const subnetsToSweep = new Set(['192.168.7', '192.168.1', '192.168.0', '192.168.2', '10.0.0', '172.20.10']);
      if (saved) {
        const match = saved.match(/^(\d+\.\d+\.\d+)\.\d+/);
        if (match) subnetsToSweep.add(match[1]);
      }
      if (curHost) {
        const match = curHost.match(/^(\d+\.\d+\.\d+)\.\d+/);
        if (match) subnetsToSweep.add(match[1]);
      }

      for (const sn of subnetsToSweep) {
        [1, 2, 3, 4, 100, 101, 102, 105, 120, 150, 163, 200].forEach(n => {
          candidateHosts.add(`${sn}.${n}:8080`);
        });
      }

      const candidateList = Array.from(candidateHosts);
      const chunkSize = 15;
      for (let i = 0; i < candidateList.length; i += chunkSize) {
        const chunk = candidateList.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (hostStr) => {
          const offer = await this.probeHost(hostStr);
          if (offer) {
            const key = `${offer.host_ip}:${offer.port || 8080}`;
            this.discoveredHosts.set(key, offer);
            this.renderHostsList();
            if (typeof MatrixEngine !== 'undefined' && MatrixEngine.refreshNodeList) {
              MatrixEngine.refreshNodeList();
            }
          }
        }));
      }

      this.isScanning = false;
      if (el.rescanIcon) el.rescanIcon.classList.remove('animate-spin-fast');
      if (typeof MatrixEngine !== 'undefined' && MatrixEngine.refreshNodeList) {
        MatrixEngine.refreshNodeList();
      }

      const count = this.discoveredHosts.size;
      if (el.discoveryCountLabel) {
        el.discoveryCountLabel.textContent = `${count} host${count === 1 ? '' : 's'} found`;
      }

      // Zero-Config Auto-Connect: If exactly 1 PC is discovered and autoConnect is requested
      if (count === 1 && autoConnect) {
        const firstHostKey = this.discoveredHosts.keys().next().value;
        const offer = this.discoveredHosts.get(firstHostKey);
        if (el.discoveryTitle) el.discoveryTitle.textContent = `Connecting to ${offer.host_name || 'PC'}...`;
        setTimeout(() => {
          this.connectToHost(firstHostKey);
        }, 350);
      } else if (count > 1) {
        if (el.discoveryTitle) el.discoveryTitle.textContent = 'Select PC to Connect';
        if (el.discoverySubtitle) el.discoverySubtitle.textContent = `Found ${count} available HUD nodes on local Wi-Fi.`;
      } else if (count === 0) {
        if (el.discoveryTitle) el.discoveryTitle.textContent = 'No PC HUD Found';
        if (el.discoverySubtitle) el.discoverySubtitle.textContent = 'Ensure PC server is running and on the same Wi-Fi.';
      }
    },

    renderHostsList() {
      if (!el.discoveredHostsList) return;
      el.discoveredHostsList.innerHTML = '';

      if (this.discoveredHosts.size === 0) {
        return;
      }

      this.discoveredHosts.forEach((host, key) => {
        const card = document.createElement('div');
        card.className = 'host-card hud-card rounded-xl p-3 border border-cyan-500/40 bg-slate-900/80 hover:border-cyan-400 flex items-center justify-between gap-3 text-left transition group';
        card.innerHTML = `
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-9 h-9 rounded-lg bg-cyan-950/80 border border-cyan-500/40 flex items-center justify-center text-cyan-400 group-hover:box-glow-cyan transition shrink-0">
              <i data-lucide="monitor" class="w-4 h-4"></i>
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition truncate">${host.host_name || 'PC-NODE'}</span>
                <span class="text-[9px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono uppercase shrink-0">${host.platform || 'WIN'}</span>
              </div>
              <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                <span class="text-slate-300 font-semibold select-all">${host.host_ip}:${host.port || 8080}</span>
                <span>•</span>
                <span class="text-emerald-400 truncate max-w-[120px] sm:max-w-[180px]">${host.gpu || 'GPU'}</span>
              </div>
            </div>
          </div>
          <button data-host="${key}" class="btn-select-host px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-300 text-xs font-bold uppercase transition flex items-center gap-1 shrink-0 cursor-pointer active:scale-95">
            <span>Connect</span>
            <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
          </button>
        `;

        card.querySelector('.btn-select-host').addEventListener('click', () => {
          this.connectToHost(key);
        });

        el.discoveredHostsList.appendChild(card);
      });

      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    },

    connectToHost(hostIpPort) {
      console.log(`[Discovery] Connecting to host: ${hostIpPort}`);
      setSavedHost(hostIpPort);
      this.hideOverlay();
      hideOfflineOverlay();

      if (el.offlineHostTarget) {
        el.offlineHostTarget.textContent = hostIpPort;
      }
      if (el.hostIp) {
        el.hostIp.textContent = hostIpPort;
      }

      closeWebRTC();
      if (socket) {
        try { socket.close(); } catch (_) {}
        socket = null;
      }

      reconnectAttempts = 0;

      // Check if we already possess a verified auth token for this host
      const token = getAuthToken(hostIpPort);
      if (!token) {
        AuthModal.show(hostIpPort);
      } else {
        connectWebSocket(true);
      }

      if (typeof MatrixEngine !== 'undefined' && MatrixEngine.refreshNodeList) {
        MatrixEngine.refreshNodeList();
      }
    }
  };

  // -------------------------------------------------------------------------
  // Host Not Found / Offline Overlay State Machine
  // -------------------------------------------------------------------------
  function showOfflineOverlay(reason) {
    isOfflineOverlayVisible = true;
    if (el.offlineOverlay) {
      el.offlineOverlay.classList.remove('offline-overlay-hidden');
      el.offlineOverlay.classList.add('offline-overlay-visible');
    }
    if (el.offlineStateDetail && reason) {
      el.offlineStateDetail.textContent = reason;
    }
    if (el.offlineHostTarget) {
      el.offlineHostTarget.textContent = getTargetHost();
    }
  }

  function hideOfflineOverlay() {
    isOfflineOverlayVisible = false;
    if (el.offlineOverlay) {
      el.offlineOverlay.classList.remove('offline-overlay-visible');
      el.offlineOverlay.classList.add('offline-overlay-hidden');
    }
    if (retryCountdownTimer) {
      clearInterval(retryCountdownTimer);
      retryCountdownTimer = null;
    }
    if (el.offlineRetryIcon) {
      el.offlineRetryIcon.classList.remove('animate-spin-fast');
    }
    if (el.offlineRetryBtnText) {
      el.offlineRetryBtnText.textContent = 'Retry Connection';
    }
  }

  // -------------------------------------------------------------------------
  // WebSocket Connection Watchdog & Lifecycles
  // -------------------------------------------------------------------------

  function setConnectionStatus(status, label) {
    if (status === 'connected') {
      el.connBadge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 box-glow-emerald';
      el.connBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-emerald-400 live-pulse"></span><span>${label || 'LIVE (1s)'}</span>`;
    } else if (status === 'reconnecting') {
      el.connBadge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-950/60 border border-amber-500/40 text-amber-400';
      el.connBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span><span>${label || 'RECONNECTING...'}</span>`;
    } else {
      el.connBadge.className = 'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-950/60 border border-rose-500/40 text-rose-400';
      el.connBadge.innerHTML = `<span class="w-2 h-2 rounded-full bg-rose-400"></span><span>${label || 'OFFLINE'}</span>`;
    }
  }

  function connectWebSocket(isManualRetry = false) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      hideOfflineOverlay();
      return;
    }

    if (socket && socket.readyState === WebSocket.CONNECTING && !isManualRetry) {
      return;
    }

    // Tear down any stale socket handle
    if (socket) {
      try {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        socket.close();
      } catch (_) {}
      socket = null;
    }

    if (retryCountdownTimer) {
      clearInterval(retryCountdownTimer);
      retryCountdownTimer = null;
    }

    setConnectionStatus('reconnecting', 'CONNECTING...');
    if (el.offlineRetryIcon) {
      el.offlineRetryIcon.classList.add('animate-spin-fast');
    }
    if (el.offlineRetryBtnText) {
      el.offlineRetryBtnText.textContent = 'Connecting...';
    }
    if (el.offlineRetryCountdown) {
      el.offlineRetryCountdown.textContent = 'Negotiating connection...';
    }

    // 1. Connection Timeout Watchdog (3.5 Seconds)
    // If the host fails to open within 3.5s, immediately flag host unreachable & display overlay
    if (connectionWatchdogTimer) clearTimeout(connectionWatchdogTimer);
    connectionWatchdogTimer = setTimeout(() => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.warn('[HUD Watchdog] Connection timed out after 3.5s. Host PC is unreachable.');
        showOfflineOverlay('Connection Timed Out (3.5s)');
        setConnectionStatus('offline', 'TIMEOUT');
        if (socket) {
          try { socket.close(); } catch (_) {}
        }
        scheduleReconnect();
      }
    }, 3500);

    const baseWs = getWebSocketUrl();
    const token = getAuthToken();
    const wsUrl = token ? `${baseWs}?token=${encodeURIComponent(token)}` : baseWs;

    try {
      socket = new WebSocket(wsUrl);

      socket.onopen = function () {
        if (connectionWatchdogTimer) {
          clearTimeout(connectionWatchdogTimer);
          connectionWatchdogTimer = null;
        }
        reconnectAttempts = 0;
        setConnectionStatus('connected', 'LIVE (1s)');
        hideOfflineOverlay();
        DiscoveryEngine.hideOverlay();
        startHeartbeat();
        fetchServerStatus();
        checkAuthStatus();
      };

      socket.onmessage = function (event) {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'pong') return;
          if (payload.type === 'PAIRING_DISABLED') {
            console.warn('[Security] Pairing disabled on host.');
            clearAuthToken();
            updateAuthShieldUI(false);
            AuthModal.show();
            return;
          }
          if (payload.type === 'AUTH_REQUIRED') {
            console.warn('[Security] Server requested device pairing.');
            clearAuthToken();
            updateAuthShieldUI(false);
            AuthModal.show();
            return;
          }
          renderTelemetry(payload);
        } catch (err) {
          console.error('[HUD] Failed to parse message JSON:', err);
        }
      };

      socket.onclose = function (event) {
        if (connectionWatchdogTimer) {
          clearTimeout(connectionWatchdogTimer);
          connectionWatchdogTimer = null;
        }
        stopHeartbeat();
        if (event && event.code === 4001) {
          console.warn('[Security] Unauthorized connection dropped (4001). Showing pairing dialog.');
          clearAuthToken();
          updateAuthShieldUI(false);
          hideOfflineOverlay();
          AuthModal.show();
          return;
        }
        const reason = !navigator.onLine ? 'Device Offline (No Network)' : 'Host PC Dropped / Disconnected';
        showOfflineOverlay(reason);
        scheduleReconnect();
      };

      socket.onerror = function () {
        if (connectionWatchdogTimer) {
          clearTimeout(connectionWatchdogTimer);
          connectionWatchdogTimer = null;
        }
        showOfflineOverlay('Host Unreachable / Refused');
        if (socket) {
          try { socket.close(); } catch (_) {}
        }
      };
    } catch (e) {
      if (connectionWatchdogTimer) {
        clearTimeout(connectionWatchdogTimer);
        connectionWatchdogTimer = null;
      }
      showOfflineOverlay('Host Unreachable');
      scheduleReconnect();
    }
  }

  function scheduleReconnect() {
    if (retryCountdownTimer) {
      clearInterval(retryCountdownTimer);
      retryCountdownTimer = null;
    }

    reconnectAttempts++;
    // Automated reconnection loop spaced every 3–5 seconds
    const delaySeconds = Math.min(5, Math.max(3, 3 + Math.floor(reconnectAttempts / 2)));
    retryCountdownSeconds = delaySeconds;

    setConnectionStatus('reconnecting', `RETRY IN ${retryCountdownSeconds}s`);
    if (el.offlineRetryCountdown) {
      el.offlineRetryCountdown.textContent = `Retrying in ${retryCountdownSeconds}s...`;
    }
    if (el.offlineRetryIcon) {
      el.offlineRetryIcon.classList.remove('animate-spin-fast');
    }
    if (el.offlineRetryBtnText) {
      el.offlineRetryBtnText.textContent = 'Retry Connection';
    }

    retryCountdownTimer = setInterval(() => {
      retryCountdownSeconds--;
      if (retryCountdownSeconds > 0) {
        setConnectionStatus('reconnecting', `RETRY IN ${retryCountdownSeconds}s`);
        if (el.offlineRetryCountdown) {
          el.offlineRetryCountdown.textContent = `Retrying in ${retryCountdownSeconds}s...`;
        }
      } else {
        clearInterval(retryCountdownTimer);
        retryCountdownTimer = null;
        connectWebSocket();
      }
    }, 1000);
  }

  function startHeartbeat() {
    stopHeartbeat();
    heartbeatTimer = setInterval(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ action: 'ping' }));
      }
    }, 15000);
  }

  function stopHeartbeat() {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  // Manual Retry Connection Button
  if (el.btnOfflineRetry) {
    el.btnOfflineRetry.addEventListener('click', (e) => {
      e.preventDefault();
      reconnectAttempts = 0;
      connectWebSocket(true);
    });
  }

  // Switch Host / Discover Button in Header
  if (el.btnSwitchServer) {
    el.btnSwitchServer.addEventListener('click', (e) => {
      e.preventDefault();
      DiscoveryEngine.showOverlay(true);
      DiscoveryEngine.startScan(false);
    });
  }

  // Offline Overlay "Scan LAN" Button
  if (el.btnOfflineScan) {
    el.btnOfflineScan.addEventListener('click', (e) => {
      e.preventDefault();
      hideOfflineOverlay();
      DiscoveryEngine.showOverlay(false);
      DiscoveryEngine.startScan(false);
    });
  }

  // Close Discovery Modal
  if (el.btnCloseDiscovery) {
    el.btnCloseDiscovery.addEventListener('click', (e) => {
      e.preventDefault();
      DiscoveryEngine.hideOverlay();
    });
  }

  // Rescan Network Button
  if (el.btnRescanHosts) {
    el.btnRescanHosts.addEventListener('click', (e) => {
      e.preventDefault();
      DiscoveryEngine.startScan(false);
    });
  }

  // Manual IP Form Submit
  if (el.manualConnectForm) {
    el.manualConnectForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = el.inputManualHost ? el.inputManualHost.value.trim() : '';
      if (!val) return;
      const formatted = val.includes(':') ? val : `${val}:8080`;
      DiscoveryEngine.connectToHost(formatted);
      if (el.inputManualHost) el.inputManualHost.value = '';
    });
  }

  // Network State Listeners (Online / Offline events)
  window.addEventListener('online', () => {
    console.log('[HUD] Network online event detected. Attempting instant reconnect...');
    if (el.offlineStateDetail) el.offlineStateDetail.textContent = 'Network Online - Connecting...';
    connectWebSocket(true);
  });

  window.addEventListener('offline', () => {
    console.warn('[HUD] Network offline event detected.');
    setConnectionStatus('offline', 'OFFLINE');
    showOfflineOverlay('Device is Offline (No Network)');
  });

  // Handle mobile screen wake / tab switch
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        connectWebSocket();
      }
      if (currentActiveTab === 'remote' && (!rtcPeerConnection || rtcPeerConnection.connectionState !== 'connected')) {
        initWebRTC();
      }
    }
  });

  // -------------------------------------------------------------------------
  // Render Telemetry & Active Gaming Session
  // -------------------------------------------------------------------------
  let cachedDisksSignature = '';
  let lastActiveGameState = false;

  function renderActiveGame(game) {
    if (!el.gameSessionCard) return;

    if (game && game.is_running) {
      // Transition card to Active Gaming State
      el.gameSessionCard.classList.remove('game-card-idle');
      el.gameSessionCard.classList.add('game-card-active');

      if (el.gameIdleContainer) el.gameIdleContainer.classList.add('hidden');
      if (el.gameActiveContainer) el.gameActiveContainer.classList.remove('hidden');

      if (el.gameTitle) el.gameTitle.textContent = game.name || 'Unknown Game';
      if (el.gameProcessBadge) el.gameProcessBadge.textContent = game.process_name || 'game.exe';
      if (el.gameSessionTime) el.gameSessionTime.textContent = game.session_time_formatted || '00:00:00';

      if (el.gameFgBadge) {
        if (game.is_foreground) {
          el.gameFgBadge.textContent = 'ACTIVE WINDOW';
          el.gameFgBadge.className = 'hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-mono uppercase';
        } else {
          el.gameFgBadge.textContent = 'BACKGROUND';
          el.gameFgBadge.className = 'hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono uppercase';
        }
      }

      if (!lastActiveGameState) {
        lastActiveGameState = true;
        if (window.lucide && typeof lucide.createIcons === 'function') {
          lucide.createIcons();
        }
      }
    } else {
      // Transition card to Idle Desktop State
      el.gameSessionCard.classList.remove('game-card-active');
      el.gameSessionCard.classList.add('game-card-idle');

      if (el.gameActiveContainer) el.gameActiveContainer.classList.add('hidden');
      if (el.gameIdleContainer) el.gameIdleContainer.classList.remove('hidden');

      if (game && game.last_session) {
        const last = game.last_session;
        if (el.gameLastSessionContainer) el.gameLastSessionContainer.classList.remove('hidden');
        if (el.gameLastSessionText) {
          el.gameLastSessionText.textContent = `${last.name} (${last.session_time_formatted || last.session_seconds + 's'})`;
        }
      } else {
        if (el.gameLastSessionContainer) el.gameLastSessionContainer.classList.add('hidden');
      }

      if (lastActiveGameState) {
        lastActiveGameState = false;
        if (window.lucide && typeof lucide.createIcons === 'function') {
          lucide.createIcons();
        }
      }
    }
  }

  function renderTelemetry(data) {
    // 0. Active Game / App Session Tracker
    if (data.active_game) {
      renderActiveGame(data.active_game);
    }

    // 1. System Metadata
    if (data.system) {
      if (el.hostName) el.hostName.textContent = data.system.hostname;
      if (el.hostIp) el.hostIp.textContent = `${data.system.lan_ip}:8080`;
      if (el.hostOs) el.hostOs.textContent = data.system.os;
      if (el.systemUptime) el.systemUptime.textContent = data.system.uptime;
    }

    // 2. CPU
    if (data.cpu) {
      const cpu = data.cpu;
      const load = cpu.overall_percent || 0;
      el.cpuLoadNum.textContent = `${Math.round(load)}%`;
      setRadialProgress(el.cpuRadial, load);

      el.cpuFreqText.textContent = `${cpu.frequency_ghz.toFixed(2)} GHz`;
      el.cpuCoresText.textContent = `${cpu.core_count_physical}C / ${cpu.core_count_logical}T`;

      if (cpu.temperature_c !== null && cpu.temperature_c !== undefined) {
        el.cpuTempBadge.textContent = `${cpu.temperature_c}°C`;
        el.cpuTempBadge.classList.remove('hidden');
      } else {
        el.cpuTempBadge.textContent = 'N/A';
      }

      // Per-thread matrix visualizer
      if (cpu.per_core_percent && Array.isArray(cpu.per_core_percent)) {
        renderCpuCores(cpu.per_core_percent);
      }
    }

    // 3. GPU (NVIDIA)
    if (data.gpu) {
      const gpu = data.gpu;
      if (!gpu.available) {
        el.gpuEmptyState.classList.remove('hidden');
        el.gpuActiveState.classList.add('hidden');
        el.gpuName.textContent = gpu.name || 'No NVIDIA GPU';
      } else {
        el.gpuEmptyState.classList.add('hidden');
        el.gpuActiveState.classList.remove('hidden');
        el.gpuName.textContent = gpu.name;
        el.gpuSourceBadge.textContent = (gpu.source || 'NVML').toUpperCase();

        const gpuLoad = gpu.core_load_percent || 0;
        el.gpuLoadNum.textContent = `${Math.round(gpuLoad)}%`;
        setRadialProgress(el.gpuRadial, gpuLoad);

        el.gpuTempText.textContent = `${gpu.temperature_c}°C`;
        el.gpuFanText.textContent = gpu.fan_speed_percent > 0 ? `${gpu.fan_speed_percent}%` : '0% (Pass)';
        el.gpuPowerText.textContent = `${gpu.power_draw_w}W / ${gpu.power_limit_w}W`;

        el.gpuVramText.textContent = `${gpu.vram_used_gb.toFixed(2)} / ${gpu.vram_total_gb.toFixed(2)} GB (${gpu.vram_percent}%)`;
        el.gpuVramBar.style.width = `${Math.min(100, gpu.vram_percent)}%`;
      }
    }

    // 4. Memory (RAM & Swap)
    if (data.memory) {
      const ram = data.memory.ram;
      const swap = data.memory.swap;

      el.ramPercentBadge.textContent = `${ram.percent}%`;
      el.ramUsedText.textContent = `${ram.used_gb.toFixed(1)} / ${ram.total_gb.toFixed(1)} GB`;
      el.ramBar.style.width = `${Math.min(100, ram.percent)}%`;

      el.swapUsedText.textContent = `${swap.used_gb.toFixed(1)} / ${swap.total_gb.toFixed(1)} GB (${swap.percent}%)`;
      el.swapBar.style.width = `${Math.min(100, swap.percent)}%`;

      el.ramAvailText.textContent = `${ram.available_gb.toFixed(1)} GB`;
      el.ramCommitText.textContent = `${ram.used_gb.toFixed(1)} GB`;
    }

    // 5. Network Throughput & Chart
    if (data.network) {
      const net = data.network;
      el.netDownRate.textContent = net.download_speed_formatted;
      el.netUpRate.textContent = net.upload_speed_formatted;
      el.netTotalRecv.textContent = `${net.total_recv_gb.toFixed(2)} GB`;
      el.netTotalSent.textContent = `${net.total_sent_gb.toFixed(2)} GB`;

      if (networkChart && net.history && net.history.length > 0) {
        updateNetworkChart(net.history);
      }
    }

    // 6. Mounted Disks
    if (data.disks && Array.isArray(data.disks)) {
      renderDisks(data.disks);
    }

    // 7. Audio Subsystem
    if (data.audio && !isUserInteractingWithVolume) {
      syncAudioState(data.audio);
    }

    // 8. Power State
    if (data.power) {
      syncPowerState(data.power);
    }
  }

  // -------------------------------------------------------------------------
  // CPU Core Matrix Renderer
  // -------------------------------------------------------------------------
  function renderCpuCores(cores) {
    if (el.cpuThreadCount) {
      el.cpuThreadCount.textContent = `${cores.length} Threads`;
    }

    let bars = el.cpuCoreGrid.children;
    if (bars.length !== cores.length) {
      // Rebuild structure once
      el.cpuCoreGrid.innerHTML = '';
      cores.forEach((_, idx) => {
        const col = document.createElement('div');
        col.className = 'flex flex-col items-center gap-1';
        col.innerHTML = `
          <div class="w-full bg-slate-900 rounded h-12 flex items-end p-0.5 border border-slate-800 overflow-hidden">
            <div class="core-bar w-full bg-cyan-400 rounded-sm transition-all duration-300" style="height: 0%"></div>
          </div>
          <span class="text-[9px] text-slate-500 font-mono">T${idx + 1}</span>
        `;
        el.cpuCoreGrid.appendChild(col);
      });
      bars = el.cpuCoreGrid.children;
    }

    // Update bar heights & colors
    cores.forEach((val, i) => {
      const bar = bars[i].querySelector('.core-bar');
      if (bar) {
        bar.style.height = `${Math.min(100, Math.max(4, val))}%`;
        if (val > 85) {
          bar.className = 'core-bar w-full bg-rose-500 rounded-sm transition-all duration-300';
        } else if (val > 65) {
          bar.className = 'core-bar w-full bg-amber-400 rounded-sm transition-all duration-300';
        } else {
          bar.className = 'core-bar w-full bg-cyan-400 rounded-sm transition-all duration-300';
        }
      }
    });
  }

  // -------------------------------------------------------------------------
  // Network Chart Update
  // -------------------------------------------------------------------------
  function updateNetworkChart(history) {
    const labels = history.map(h => h.time);
    const downData = history.map(h => h.download_kbps);
    const upData = history.map(h => h.upload_kbps);

    networkChart.data.labels = labels;
    networkChart.data.datasets[0].data = downData;
    networkChart.data.datasets[1].data = upData;
    networkChart.update('none'); // Update without full redraw animation for 60fps performance
  }

  // -------------------------------------------------------------------------
  // Disks Renderer
  // -------------------------------------------------------------------------
  function renderDisks(disks) {
    const sig = JSON.stringify(disks.map(d => [d.mountpoint, d.percent, d.used_gb]));
    if (sig === cachedDisksSignature) return;
    cachedDisksSignature = sig;

    el.diskCountBadge.textContent = `${disks.length} Partition${disks.length === 1 ? '' : 's'}`;
    el.diskListContainer.innerHTML = '';

    disks.forEach(d => {
      const isCritical = d.percent >= 90;
      const isWarn = d.percent >= 75 && d.percent < 90;
      const barColor = isCritical
        ? 'bg-rose-500'
        : isWarn
        ? 'bg-amber-400'
        : 'bg-emerald-400';

      const item = document.createElement('div');
      item.className = 'bg-slate-900/70 p-2.5 rounded-lg border border-slate-800';
      item.innerHTML = `
        <div class="flex items-center justify-between mb-1 text-xs">
          <div class="flex items-center gap-2">
            <span class="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 font-bold text-[11px]">${d.device}</span>
            <span class="text-slate-400 text-[10px]">${d.fstype}</span>
          </div>
          <div class="text-[11px] text-slate-300">
            <span class="font-bold text-slate-100">${d.used_gb.toFixed(1)}</span> / ${d.total_gb.toFixed(1)} GB
            <span class="text-slate-400 font-normal">(${d.percent}%)</span>
          </div>
        </div>
        <div class="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div class="${barColor} h-full transition-all duration-500" style="width: ${d.percent}%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-500 mt-1">
          <span>Free: ${(d.free_gb).toFixed(1)} GB</span>
          <span>Mounted at: ${d.mountpoint}</span>
        </div>
      `;
      el.diskListContainer.appendChild(item);
    });
  }

  // -------------------------------------------------------------------------
  // Audio Controls & Reactive Binding
  // -------------------------------------------------------------------------
  function syncAudioState(audio) {
    el.audioSlider.value = audio.volume;
    el.volumeValText.textContent = `${audio.volume}%`;

    if (audio.is_muted) {
      el.muteLabel.textContent = 'MUTED';
      el.btnToggleMute.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition duration-200 bg-rose-950/80 border-rose-500 text-rose-300 box-glow-rose';
      el.muteIcon.setAttribute('data-lucide', 'volume-x');
    } else {
      el.muteLabel.textContent = 'ACTIVE';
      el.btnToggleMute.className = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition duration-200 bg-emerald-950/60 border-emerald-500/40 text-emerald-400';
      el.muteIcon.setAttribute('data-lucide', 'volume-2');
    }
    lucide.createIcons();
  }

  // Audio Slider Interactions
  el.audioSlider.addEventListener('input', (e) => {
    isUserInteractingWithVolume = true;
    const val = parseInt(e.target.value, 10);
    el.volumeValText.textContent = `${val}%`;

    clearTimeout(volumeDebounceTimer);
    volumeDebounceTimer = setTimeout(() => {
      sendAudioVolume(val);
      isUserInteractingWithVolume = false;
    }, 150);
  });

  el.audioSlider.addEventListener('change', (e) => {
    const val = parseInt(e.target.value, 10);
    sendAudioVolume(val);
    isUserInteractingWithVolume = false;
  });

  // Mute button
  el.btnToggleMute.addEventListener('click', () => {
    fetch(getApiUrl('/api/audio/mute'), { method: 'POST', headers: getAuthHeaders() })
      .then(r => r.json())
      .then(res => {
        if (res.success) {
          syncAudioState({ volume: res.volume, is_muted: res.is_muted });
        }
      })
      .catch(err => console.error('Audio mute toggle failed:', err));
  });

  // Volume Presets (0%, 25%, 50%, 75%, 100%)
  el.volPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetVol = parseInt(btn.getAttribute('data-vol'), 10);
      el.audioSlider.value = targetVol;
      el.volumeValText.textContent = `${targetVol}%`;
      sendAudioVolume(targetVol);
    });
  });

  function sendAudioVolume(vol) {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action: 'set_volume', volume: vol }));
    } else {
      fetch(getApiUrl('/api/audio/volume'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ volume: vol })
      }).catch(err => console.error('Failed to set volume:', err));
    }
  }

  // -------------------------------------------------------------------------
  // Power Controls & Modal Handling
  // -------------------------------------------------------------------------
  let pendingPowerType = null;
  let modalCountdownInterval = null;

  function syncPowerState(power) {
    if (power.is_pending && power.seconds_remaining > 0) {
      el.powerAlertBanner.classList.remove('hidden');
      el.powerAlertText.textContent = `PC ${power.action.toUpperCase()} SCHEDULED: ${power.seconds_remaining}s REMAINING`;
    } else {
      el.powerAlertBanner.classList.add('hidden');
    }
  }

  el.btnCancelPowerBanner.addEventListener('click', cancelPowerAction);

  // Trigger Sleep Button
  el.btnTriggerSleep.addEventListener('click', () => {
    openPowerModal('sleep', 15);
  });

  // Trigger Shutdown Button
  el.btnTriggerShutdown.addEventListener('click', () => {
    openPowerModal('shutdown', 30);
  });

  function openPowerModal(action, defaultSeconds) {
    pendingPowerType = action;
    el.modalTitle.textContent = `CONFIRM PC ${action.toUpperCase()}`;
    el.modalDesc.textContent = `The host PC will enter ${action} state. You can abort at any time before timer expiry.`;

    el.modalCountdownNum.textContent = `${defaultSeconds}s`;
    el.modalCountdownBar.style.width = '100%';
    el.powerConfirmModal.classList.remove('hidden');

    let secondsLeft = defaultSeconds;
    clearInterval(modalCountdownInterval);

    // Call API to schedule the action immediately on the PC
    const endpoint = action === 'sleep' ? '/api/power/sleep' : '/api/power/shutdown';
    fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ delay_seconds: defaultSeconds })
    }).catch(e => console.error('Schedule failed:', e));

    modalCountdownInterval = setInterval(() => {
      secondsLeft--;
      if (secondsLeft <= 0) {
        clearInterval(modalCountdownInterval);
        el.modalCountdownNum.textContent = '0s';
        el.modalCountdownBar.style.width = '0%';
        el.powerConfirmModal.classList.add('hidden');
      } else {
        el.modalCountdownNum.textContent = `${secondsLeft}s`;
        el.modalCountdownBar.style.width = `${(secondsLeft / defaultSeconds) * 100}%`;
      }
    }, 1000);
  }

  el.btnModalCancel.addEventListener('click', () => {
    cancelPowerAction();
    closePowerModal();
  });

  el.btnModalConfirm.addEventListener('click', () => {
    // Confirm instantly (optional: reduce delay to 1s)
    const endpoint = pendingPowerType === 'sleep' ? '/api/power/sleep' : '/api/power/shutdown';
    fetch(getApiUrl(endpoint), {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ delay_seconds: 2 })
    }).catch(e => console.error(e));
    closePowerModal();
  });

  function closePowerModal() {
    clearInterval(modalCountdownInterval);
    el.powerConfirmModal.classList.add('hidden');
    pendingPowerType = null;
  }

  function cancelPowerAction() {
    closePowerModal();
    fetch(getApiUrl('/api/power/cancel'), { method: 'POST', headers: getAuthHeaders() })
      .then(r => r.json())
      .then(() => {
        el.powerAlertBanner.classList.add('hidden');
      })
      .catch(e => console.error('Failed to cancel power action:', e));
  }

  // -------------------------------------------------------------------------
  // Mobile Keep-Awake Screen Wake Lock Engine (Web Wake Lock API)
  // -------------------------------------------------------------------------
  let wakeLock = null;
  let isWakeLockEnabled = true;

  async function requestWakeLock() {
    if (!('wakeLock' in navigator)) {
      updateWakeLockUI('unsupported');
      return;
    }
    try {
      wakeLock = await navigator.wakeLock.request('screen');
      updateWakeLockUI('active');

      wakeLock.addEventListener('release', () => {
        if (!isWakeLockEnabled) {
          updateWakeLockUI('inactive');
        }
      });
    } catch (err) {
      console.warn('[WakeLock] Request failed:', err);
      updateWakeLockUI('inactive');
    }
  }

  async function releaseWakeLock() {
    if (wakeLock) {
      try {
        await wakeLock.release();
      } catch (_) {}
      wakeLock = null;
    }
    updateWakeLockUI('inactive');
  }

  async function toggleWakeLock() {
    if (!('wakeLock' in navigator)) {
      updateWakeLockUI('unsupported');
      return;
    }
    isWakeLockEnabled = !isWakeLockEnabled;
    if (isWakeLockEnabled) {
      await requestWakeLock();
    } else {
      await releaseWakeLock();
    }
  }

  function updateWakeLockUI(state) {
    if (!el.btnKeepAwake) return;
    if (state === 'active') {
      el.btnKeepAwake.className = 'wake-lock-active flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition shadow-sm active:scale-95 cursor-pointer';
      if (el.wakeLockText) el.wakeLockText.textContent = 'Awake ON';
      el.btnKeepAwake.title = 'Screen Wake Lock Active (Tap to allow sleep)';
    } else if (state === 'inactive') {
      el.btnKeepAwake.className = 'wake-lock-inactive flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition shadow-sm active:scale-95 cursor-pointer';
      if (el.wakeLockText) el.wakeLockText.textContent = 'Awake OFF';
      el.btnKeepAwake.title = 'Screen Wake Lock Inactive (Tap to keep awake)';
    } else if (state === 'unsupported') {
      el.btnKeepAwake.className = 'wake-lock-unsupported flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-slate-900 border-slate-800 text-slate-500';
      if (el.wakeLockText) el.wakeLockText.textContent = 'Awake N/A';
      el.btnKeepAwake.title = 'Wake Lock API not supported on this browser';
    }
  }

  // Automatically reacquire wake lock when tab returns to foreground
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && isWakeLockEnabled) {
      requestWakeLock();
    }
  });

  if (el.btnKeepAwake) {
    el.btnKeepAwake.addEventListener('click', (e) => {
      e.preventDefault();
      toggleWakeLock();
    });
  }

  // -------------------------------------------------------------------------
  // Multi-PC Matrix View Engine (Parallel LAN Polling & Responsive Grid)
  // -------------------------------------------------------------------------
  const MatrixEngine = {
    pollingInterval: null,
    isPolling: false,
    nodes: new Map(), // hostKey -> { hostKey, element, lastData, isOnline, failCount }

    init() {
      this.refreshNodeList();
    },

    getKnownHosts() {
      const hosts = new Set();
      const target = getTargetHost();
      if (target) hosts.add(target);

      const saved = getSavedHost();
      if (saved) hosts.add(saved);

      const curHost = window.location.host;
      if (curHost && !curHost.startsWith('localhost') && !curHost.startsWith('127.0.0.1')) {
        hosts.add(curHost);
      }

      DiscoveryEngine.discoveredHosts.forEach((_, key) => {
        hosts.add(key);
      });

      if (hosts.size === 0) {
        hosts.add('127.0.0.1:8080');
      }

      return Array.from(hosts);
    },

    refreshNodeList() {
      const knownHosts = this.getKnownHosts();

      knownHosts.forEach(hostKey => {
        if (!this.nodes.has(hostKey)) {
          this.nodes.set(hostKey, {
            hostKey,
            element: null,
            lastData: null,
            isOnline: false,
            failCount: 0
          });
        }
      });

      if (el.matrixHostCountBadge) {
        el.matrixHostCountBadge.textContent = this.nodes.size;
      }

      this.nodes.forEach((node) => {
        this.ensureCardDOM(node);
      });
    },

    startPolling() {
      this.refreshNodeList();
      this.stopPolling();
      this.isPolling = true;
      this.pollAll();
      this.pollingInterval = setInterval(() => {
        this.pollAll();
      }, 1500);
    },

    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
      this.isPolling = false;
    },

    async pollAll() {
      if (!this.isPolling && currentActiveTab !== 'matrix') return;

      const promises = [];
      const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';

      this.nodes.forEach((node, hostKey) => {
        const url = `${proto}//${hostKey}/api/telemetry`;
        const headers = getAuthHeaders(hostKey);
        const p = fetch(url, {
          method: 'GET',
          signal: AbortSignal.timeout(1300),
          headers: headers
        })
        .then(async (res) => {
          if (res.status === 401) {
            node.isOnline = true;
            node.isLocked = true;
            this.updateCardLockedUI(node);
            return;
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = await res.json();
          node.isOnline = true;
          node.isLocked = false;
          node.failCount = 0;
          node.lastData = data;
          this.updateCardUI(node, data);
        })
        .catch(() => {
          node.failCount = (node.failCount || 0) + 1;
          if (node.failCount >= 2) {
            node.isOnline = false;
          }
          this.updateCardOfflineUI(node);
        });

        promises.push(p);
      });

      await Promise.allSettled(promises);
    },

    ensureCardDOM(node) {
      if (node.element && document.getElementById(node.element.id)) {
        return;
      }
      if (!el.matrixGrid) return;

      const safeId = 'matrix-card-' + node.hostKey.replace(/[^a-zA-Z0-9]/g, '_');
      let card = document.getElementById(safeId);
      if (!card) {
        card = document.createElement('div');
        card.id = safeId;
        card.className = 'matrix-pc-card hud-card rounded-xl p-4 border border-slate-800 relative flex flex-col justify-between gap-3 overflow-hidden';
        card.innerHTML = `
          <div class="hud-corner hud-corner-tl"></div>
          <div class="hud-corner hud-corner-tr"></div>
          <div class="hud-corner hud-corner-bl"></div>
          <div class="hud-corner hud-corner-br"></div>

          <!-- Card Header -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-2.5 min-w-0">
              <div class="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 matrix-node-icon">
                <i data-lucide="monitor" class="w-4 h-4"></i>
              </div>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="matrix-hostname text-xs sm:text-sm font-bold text-slate-100 truncate">${node.hostKey}</span>
                  <span class="matrix-os-badge text-[9px] px-1.5 py-0.2 rounded font-mono uppercase badge-os-unknown">PC</span>
                  <span class="matrix-active-badge hidden text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono uppercase">ACTIVE</span>
                </div>
                <div class="matrix-ip-text text-[10px] text-slate-400 font-mono mt-0.5 truncate select-all">${node.hostKey}</div>
              </div>
            </div>

            <!-- Status Pill -->
            <div class="matrix-status-pill flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-900 border border-slate-800 text-slate-400 shrink-0">
              <span class="matrix-status-dot w-2 h-2 rounded-full bg-slate-500"></span>
              <span class="matrix-status-label">PROBING</span>
            </div>
          </div>

          <!-- Active Game Session Banner (Conditional) -->
          <div class="matrix-game-banner hidden rounded-lg p-2 bg-violet-950/70 border border-violet-500/50 flex items-center justify-between gap-2">
            <div class="flex items-center gap-2 min-w-0">
              <div class="w-6 h-6 rounded bg-violet-900/80 flex items-center justify-center text-violet-300 shrink-0">
                <i data-lucide="gamepad-2" class="w-3.5 h-3.5"></i>
              </div>
              <div class="min-w-0">
                <span class="matrix-game-title text-xs font-bold text-violet-200 block truncate">Counter-Strike 2</span>
                <span class="matrix-game-proc text-[9px] text-violet-400 font-mono block truncate">cs2.exe</span>
              </div>
            </div>
            <div class="text-right shrink-0">
              <span class="matrix-game-time text-xs font-black text-cyan-300 font-mono">00:00:00</span>
            </div>
          </div>

          <!-- Compact Progress Gauges (CPU, GPU, RAM) -->
          <div class="flex flex-col gap-2.5 my-1">
            <!-- CPU Gauge -->
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                <span class="text-slate-400 font-semibold flex items-center gap-1">
                  <i data-lucide="cpu" class="w-3 h-3 text-cyan-400"></i>
                  <span>CPU</span>
                </span>
                <div class="flex items-center gap-2">
                  <span class="matrix-cpu-temp text-slate-500 text-[10px]">--°C</span>
                  <span class="matrix-cpu-val font-bold text-cyan-400">--%</span>
                </div>
              </div>
              <div class="matrix-gauge-bar">
                <div class="matrix-cpu-bar matrix-gauge-fill-cpu" style="width: 0%"></div>
              </div>
            </div>

            <!-- GPU Gauge -->
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                <span class="text-slate-400 font-semibold flex items-center gap-1">
                  <i data-lucide="zap" class="w-3 h-3 text-violet-400"></i>
                  <span class="matrix-gpu-label truncate max-w-[120px]">GPU</span>
                </span>
                <div class="flex items-center gap-2">
                  <span class="matrix-gpu-temp text-slate-500 text-[10px]">--°C</span>
                  <span class="matrix-gpu-val font-bold text-violet-400">--%</span>
                </div>
              </div>
              <div class="matrix-gauge-bar">
                <div class="matrix-gpu-bar matrix-gauge-fill-gpu" style="width: 0%"></div>
              </div>
            </div>

            <!-- RAM Gauge -->
            <div>
              <div class="flex items-center justify-between text-[11px] font-mono mb-1">
                <span class="text-slate-400 font-semibold flex items-center gap-1">
                  <i data-lucide="hard-drive" class="w-3 h-3 text-blue-400"></i>
                  <span>RAM</span>
                </span>
                <div class="flex items-center gap-2">
                  <span class="matrix-ram-sub text-slate-500 text-[10px]">-- / -- GB</span>
                  <span class="matrix-ram-val font-bold text-blue-400">--%</span>
                </div>
              </div>
              <div class="matrix-gauge-bar">
                <div class="matrix-ram-bar matrix-gauge-fill-ram" style="width: 0%"></div>
              </div>
            </div>
          </div>

          <!-- Card Action Buttons -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button class="btn-matrix-focus flex-1 py-1.5 px-2 rounded-lg bg-cyan-950/70 hover:bg-cyan-900 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <i data-lucide="activity" class="w-3.5 h-3.5"></i>
              <span>Focus HUD</span>
            </button>
            <button class="btn-matrix-remote flex-1 py-1.5 px-2 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95">
              <i data-lucide="monitor" class="w-3.5 h-3.5"></i>
              <span>Remote</span>
            </button>
          </div>
        `;

        card.querySelector('.btn-matrix-focus').addEventListener('click', (e) => {
          e.preventDefault();
          if (node.isLocked) {
            AuthModal.show(node.hostKey);
          } else {
            DiscoveryEngine.connectToHost(node.hostKey);
            switchTab('telemetry');
          }
        });

        card.querySelector('.btn-matrix-remote').addEventListener('click', (e) => {
          e.preventDefault();
          DiscoveryEngine.connectToHost(node.hostKey);
          switchTab('remote');
        });

        el.matrixGrid.appendChild(card);
        if (window.lucide && typeof lucide.createIcons === 'function') {
          lucide.createIcons();
        }
      }

      node.element = card;
    },

    updateCardUI(node, data) {
      if (!node.element) this.ensureCardDOM(node);
      const card = node.element;
      if (!card) return;

      const isCurrentTarget = node.hostKey === getTargetHost() || (data.system?.lan_ip && getTargetHost().startsWith(data.system.lan_ip));

      if (isCurrentTarget) {
        card.classList.add('matrix-pc-active-target');
        card.querySelector('.matrix-active-badge')?.classList.remove('hidden');
      } else {
        card.classList.remove('matrix-pc-active-target');
        card.querySelector('.matrix-active-badge')?.classList.add('hidden');
      }
      card.classList.remove('matrix-pc-offline');

      // Hostname & IP
      const hostnameEl = card.querySelector('.matrix-hostname');
      if (hostnameEl) hostnameEl.textContent = data.system?.hostname || node.hostKey;
      const ipEl = card.querySelector('.matrix-ip-text');
      if (ipEl) ipEl.textContent = `${data.system?.lan_ip || node.hostKey} • ${data.system?.uptime || ''}`;

      // OS Badge
      const osBadge = card.querySelector('.matrix-os-badge');
      if (osBadge) {
        const osStr = (data.system?.os || '').toLowerCase();
        osBadge.className = 'matrix-os-badge text-[9px] px-1.5 py-0.2 rounded font-mono uppercase ';
        if (osStr.includes('win')) {
          osBadge.className += 'badge-os-win';
          osBadge.textContent = 'WIN';
        } else if (osStr.includes('linux')) {
          osBadge.className += 'badge-os-linux';
          osBadge.textContent = 'LINUX';
        } else if (osStr.includes('mac') || osStr.includes('darwin')) {
          osBadge.className += 'badge-os-mac';
          osBadge.textContent = 'MACOS';
        } else {
          osBadge.className += 'badge-os-unknown';
          osBadge.textContent = 'PC';
        }
      }

      // Status Pill
      const statusPill = card.querySelector('.matrix-status-pill');
      const statusDot = card.querySelector('.matrix-status-dot');
      const statusLabel = card.querySelector('.matrix-status-label');
      if (statusPill && statusDot && statusLabel) {
        statusPill.className = 'matrix-status-pill flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 shrink-0';
        statusDot.className = 'matrix-status-dot w-2 h-2 rounded-full bg-emerald-400 live-pulse';
        statusLabel.textContent = 'ONLINE';
      }

      // Active Game Banner
      const gameBanner = card.querySelector('.matrix-game-banner');
      if (gameBanner) {
        if (data.active_game?.is_running) {
          gameBanner.classList.remove('hidden');
          const titleEl = card.querySelector('.matrix-game-title');
          const procEl = card.querySelector('.matrix-game-proc');
          const timeEl = card.querySelector('.matrix-game-time');
          if (titleEl) titleEl.textContent = data.active_game.game_name || data.active_game.name || 'Game Active';
          if (procEl) procEl.textContent = data.active_game.process_name || '';
          if (timeEl) timeEl.textContent = data.active_game.session_time_formatted || '00:00:00';
        } else {
          gameBanner.classList.add('hidden');
        }
      }

      // CPU Gauge
      const cpuVal = card.querySelector('.matrix-cpu-val');
      const cpuTemp = card.querySelector('.matrix-cpu-temp');
      const cpuBar = card.querySelector('.matrix-cpu-bar');
      if (cpuVal && data.cpu) {
        const pct = Math.round(data.cpu.overall_percent || 0);
        cpuVal.textContent = `${pct}%`;
        if (cpuBar) cpuBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        if (cpuTemp) {
          cpuTemp.textContent = data.cpu.temperature_c ? `${Math.round(data.cpu.temperature_c)}°C` : '';
        }
      }

      // GPU Gauge
      const gpuVal = card.querySelector('.matrix-gpu-val');
      const gpuTemp = card.querySelector('.matrix-gpu-temp');
      const gpuBar = card.querySelector('.matrix-gpu-bar');
      const gpuLabel = card.querySelector('.matrix-gpu-label');
      if (gpuVal) {
        if (data.gpu?.available) {
          const pct = Math.round(data.gpu.core_load_percent || 0);
          gpuVal.textContent = `${pct}%`;
          if (gpuBar) gpuBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
          if (gpuTemp) {
            gpuTemp.textContent = data.gpu.temperature_c ? `${Math.round(data.gpu.temperature_c)}°C` : '';
          }
          if (gpuLabel && data.gpu.name) {
            gpuLabel.textContent = data.gpu.name.replace(/NVIDIA|GeForce|AMD|Radeon/gi, '').trim() || 'GPU';
          }
        } else {
          gpuVal.textContent = 'N/A';
          if (gpuBar) gpuBar.style.width = '0%';
          if (gpuTemp) gpuTemp.textContent = '';
        }
      }

      // RAM Gauge
      const ramVal = card.querySelector('.matrix-ram-val');
      const ramSub = card.querySelector('.matrix-ram-sub');
      const ramBar = card.querySelector('.matrix-ram-bar');
      if (ramVal && data.memory?.ram) {
        const ram = data.memory.ram;
        const pct = Math.round(ram.percent || 0);
        ramVal.textContent = `${pct}%`;
        if (ramBar) ramBar.style.width = `${Math.min(100, Math.max(0, pct))}%`;
        if (ramSub) {
          ramSub.textContent = `${ram.used_gb?.toFixed(1) || 0}/${ram.total_gb?.toFixed(0) || 0} GB`;
        }
      }
    },

    updateCardOfflineUI(node) {
      if (!node.element) this.ensureCardDOM(node);
      const card = node.element;
      if (!card) return;

      card.classList.add('matrix-pc-offline');
      card.classList.remove('matrix-pc-active-target');

      const statusPill = card.querySelector('.matrix-status-pill');
      const statusDot = card.querySelector('.matrix-status-dot');
      const statusLabel = card.querySelector('.matrix-status-label');
      if (statusPill && statusDot && statusLabel) {
        statusPill.className = 'matrix-status-pill flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-950/60 border border-rose-500/40 text-rose-400 shrink-0';
        statusDot.className = 'matrix-status-dot w-2 h-2 rounded-full bg-rose-400';
        statusLabel.textContent = 'OFFLINE';
      }

      card.querySelector('.matrix-game-banner')?.classList.add('hidden');
    },

    updateCardLockedUI(node) {
      if (!node.element) this.ensureCardDOM(node);
      const card = node.element;
      if (!card) return;

      card.classList.add('matrix-pc-locked');
      card.classList.remove('matrix-pc-offline', 'matrix-pc-active-target');

      const statusPill = card.querySelector('.matrix-status-pill');
      const statusDot = card.querySelector('.matrix-status-dot');
      const statusLabel = card.querySelector('.matrix-status-label');
      if (statusPill && statusDot && statusLabel) {
        statusPill.className = 'matrix-status-pill flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950/70 border border-amber-500/50 text-amber-300 shrink-0';
        statusDot.className = 'matrix-status-dot w-2 h-2 rounded-full bg-amber-400';
        statusLabel.textContent = 'LOCKED';
      }

      const focusBtn = card.querySelector('.btn-matrix-focus');
      if (focusBtn) {
        focusBtn.innerHTML = '<i data-lucide="key-round" class="w-3.5 h-3.5"></i><span>Pair</span>';
        focusBtn.className = 'btn-matrix-focus flex-1 py-1.5 px-2 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95';
      }
      if (window.lucide && typeof lucide.createIcons === 'function') {
        lucide.createIcons();
      }
    }
  };

  // -------------------------------------------------------------------------
  // Remote Desktop WebRTC Subsystem & Touch Controls
  // -------------------------------------------------------------------------

  function switchTab(tab) {
    currentActiveTab = tab;

    const inactiveTabClass = 'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-500 transition flex items-center gap-2 shrink-0';
    const activeTabClass = 'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500 transition tab-active flex items-center gap-2 shrink-0';

    el.telemetryView.classList.add('hidden');
    el.remoteView.classList.add('hidden');
    if (el.matrixView) el.matrixView.classList.add('hidden');

    el.tabBtnTelemetry.className = inactiveTabClass;
    el.tabBtnRemote.className = inactiveTabClass;
    if (el.tabBtnMatrix) el.tabBtnMatrix.className = inactiveTabClass;

    if (tab === 'remote') {
      el.remoteView.classList.remove('hidden');
      el.tabBtnRemote.className = activeTabClass;
      MatrixEngine.stopPolling();

      if (!isWebRTCActive) {
        initWebRTC();
      }
    } else {
      if (isWebRTCActive) {
        closeWebRTC();
      }
      if (tab === 'telemetry') {
        el.telemetryView.classList.remove('hidden');
        el.tabBtnTelemetry.className = activeTabClass;
        MatrixEngine.stopPolling();
      } else if (tab === 'matrix') {
        if (el.matrixView) el.matrixView.classList.remove('hidden');
        if (el.tabBtnMatrix) el.tabBtnMatrix.className = activeTabClass;
        MatrixEngine.startPolling();
      }
    }

    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
  }

  el.tabBtnTelemetry.addEventListener('click', () => switchTab('telemetry'));
  el.tabBtnRemote.addEventListener('click', () => switchTab('remote'));
  if (el.tabBtnMatrix) {
    el.tabBtnMatrix.addEventListener('click', () => switchTab('matrix'));
  }

  if (el.btnMatrixScan) {
    el.btnMatrixScan.addEventListener('click', async (e) => {
      e.preventDefault();
      if (el.matrixScanIcon) el.matrixScanIcon.classList.add('animate-spin-fast');
      await DiscoveryEngine.startScan(false);
      if (el.matrixScanIcon) el.matrixScanIcon.classList.remove('animate-spin-fast');
      MatrixEngine.refreshNodeList();
      await MatrixEngine.pollAll();
    });
  }

  function setRtcBadge(status, text) {
    if (!el.rtcStateBadge) return;
    if (status === 'connected') {
      el.rtcStateBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-semibold uppercase';
      el.rtcStateBadge.textContent = text || 'LIVE 60FPS';
    } else if (status === 'connecting') {
      el.rtcStateBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-400 font-semibold uppercase';
      el.rtcStateBadge.textContent = text || 'CONNECTING...';
    } else {
      el.rtcStateBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-rose-950/60 border border-rose-500/40 text-rose-400 font-semibold uppercase';
      el.rtcStateBadge.textContent = text || 'OFFLINE';
    }
  }

  async function initWebRTC() {
    closeWebRTC();
    setRtcBadge('connecting', 'INITIALIZING...');

    try {
      rtcPeerConnection = new RTCPeerConnection({ iceServers: [] });
      isWebRTCActive = true;

      // Add transceivers for Video and Loopback Audio
      rtcPeerConnection.addTransceiver('video', { direction: 'recvonly' });
      rtcPeerConnection.addTransceiver('audio', { direction: 'recvonly' });

      // Create ultra-low-latency input DataChannel
      rtcDataChannel = rtcPeerConnection.createDataChannel('input_stream', { ordered: true });
      rtcDataChannel.onopen = () => console.log('[WebRTC DataChannel] input_stream OPEN');
      rtcDataChannel.onclose = () => console.log('[WebRTC DataChannel] input_stream CLOSED');

      // Bind incoming media streams to remote video and audio elements
      rtcPeerConnection.ontrack = (event) => {
        const remoteVideo = document.getElementById("remoteVideo");
        if (event.track.kind === "video") {
          remoteVideo.srcObject = event.streams[0] || new MediaStream([event.track]);
          remoteVideo.play().catch((err) => {
            console.warn("Video play blocked until user gesture:", err);
          });
          setRtcBadge('connected', 'LIVE 60FPS');
        }
        if (event.track.kind === "audio") {
          const audioEl = document.getElementById("remoteAudio") || new Audio();
          audioEl.srcObject = event.streams[0] || new MediaStream([event.track]);
          audioEl.play().catch((err) => {
            console.warn("Audio play blocked until user gesture:", err);
          });
        }
      };

      rtcPeerConnection.onconnectionstatechange = () => {
        const state = rtcPeerConnection.connectionState;
        if (state === 'connected') {
          setRtcBadge('connected', 'LIVE 60FPS');
        } else if (state === 'connecting') {
          setRtcBadge('connecting', 'CONNECTING...');
        } else if (state === 'failed' || state === 'closed' || state === 'disconnected') {
          setRtcBadge('disconnected', 'DISCONNECTED');
        }
      };

      // Create Offer & Exchange SDP
      const offer = await rtcPeerConnection.createOffer();
      await rtcPeerConnection.setLocalDescription(offer);

      const response = await fetch(getApiUrl('/api/rtc/offer'), {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ sdp: offer.sdp, type: offer.type, token: getAuthToken() })
      });

      if (!response.ok) {
        if (response.status === 401) {
          AuthModal.show();
          throw new Error('Device pairing required for remote desktop');
        }
        throw new Error(`Signaling failed: ${response.statusText}`);
      }

      const answer = await response.json();
      await rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));

    } catch (err) {
      console.error('[WebRTC Initialization Error]', err);
      setRtcBadge('disconnected', 'ERROR');
      isWebRTCActive = false;
    }
  }

  function closeWebRTC() {
    if (rtcDataChannel) {
      try { rtcDataChannel.close(); } catch (e) {}
      rtcDataChannel = null;
    }
    if (rtcPeerConnection) {
      try { rtcPeerConnection.close(); } catch (e) {}
      rtcPeerConnection = null;
    }
    fetch(getApiUrl('/api/rtc/close'), {
      method: 'POST',
      headers: getAuthHeaders()
    }).catch(() => {});
    isWebRTCActive = false;
    setRtcBadge('disconnected', 'IDLE');
  }

  function sendInput(data) {
    if (rtcDataChannel && rtcDataChannel.readyState === "open") {
      rtcDataChannel.send(JSON.stringify(data));
    } else {
      console.warn("DataChannel is not open. Current state:", rtcDataChannel?.readyState);
    }
  }

  // User-Gesture Activation ("Start Stream & Unmute" button)
  el.btnStartStream.addEventListener('click', async () => {
    const remoteVideo = document.getElementById("remoteVideo");
    const audioEl = document.getElementById("remoteAudio");

    // Unmute video & audio
    if (remoteVideo) remoteVideo.muted = false;
    if (audioEl) audioEl.muted = false;

    // Trigger playback
    if (remoteVideo) {
      remoteVideo.play().catch((e) => console.warn("Video play policy:", e));
    }
    if (audioEl) {
      audioEl.play().catch((e) => console.warn("Audio play policy:", e));
    }

    el.audioAutoplayOverlay.classList.add('hidden');

    if (!isWebRTCActive) {
      await initWebRTC();
    }
  });

  el.btnRestartStream.addEventListener('click', () => {
    initWebRTC();
  });

  // -------------------------------------------------------------------------
  // Touch-to-Mouse & Gesture Mapping Engine
  // -------------------------------------------------------------------------
  const video = document.getElementById("remoteVideo") || el.remoteVideo;

  function getNormalizedCoords(touch) {
    const rect = video.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (touch.clientY - rect.top) / rect.height));
    return { x, y };
  }

  let twoFingerStartY = 0;
  let twoFingerStartTime = 0;
  let twoFingerMoved = false;

  video.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const { x, y } = getNormalizedCoords(e.touches[0]);
      sendInput({ type: "mouse_click", button: "left", action: "down", x, y });
    } else if (e.touches.length === 2) {
      twoFingerStartTime = Date.now();
      twoFingerStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      twoFingerMoved = false;
    }
  }, { passive: false });

  video.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (e.touches.length === 1) {
      const { x, y } = getNormalizedCoords(e.touches[0]);
      sendInput({ type: "mouse_move", x, y });
    } else if (e.touches.length === 2) {
      const currentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      const deltaY = currentY - twoFingerStartY;
      twoFingerStartY = currentY;

      if (Math.abs(deltaY) > 2) {
        twoFingerMoved = true;
        // Invert deltaY for natural scroll on Windows
        sendInput({ type: "mouse_scroll", dx: 0, dy: deltaY * 1.5 });
      }
    }
  }, { passive: false });

  video.addEventListener("touchend", (e) => {
    e.preventDefault();
    if (e.touches.length === 0) {
      if (twoFingerStartTime > 0 && !twoFingerMoved && (Date.now() - twoFingerStartTime) < 350) {
        sendInput({ type: "mouse_click", button: "right", action: "click" });
        twoFingerStartTime = 0;
      } else {
        sendInput({ type: "mouse_click", button: "left", action: "up" });
      }
    }
  }, { passive: false });

  // Desktop Mouse Support (Click & Drag directly on video)
  video.addEventListener('mousemove', (e) => {
    if (e.buttons === 0 && !isWebRTCActive) return;
    const rect = video.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    sendInput({ type: 'mouse_move', x, y });
  });

  video.addEventListener('mousedown', (e) => {
    e.preventDefault();
    const btn = e.button === 2 ? 'right' : 'left';
    const rect = video.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    sendInput({ type: 'mouse_click', button: btn, action: 'down', x, y });
  });

  video.addEventListener('mouseup', (e) => {
    e.preventDefault();
    const btn = e.button === 2 ? 'right' : 'left';
    sendInput({ type: 'mouse_click', button: btn, action: 'up' });
  });

  video.addEventListener('wheel', (e) => {
    e.preventDefault();
    const dy = e.deltaY > 0 ? -3 : 3;
    sendInput({ type: 'mouse_scroll', dx: 0, dy });
  }, { passive: false });

  video.addEventListener('contextmenu', (e) => e.preventDefault());

  // -------------------------------------------------------------------------
  // Virtual Keyboard & Quick Key Controls
  // -------------------------------------------------------------------------
  el.btnToggleKeyboard.addEventListener('click', () => {
    el.virtualKeyboardInput.focus();
    el.btnToggleKeyboard.classList.toggle('border-cyan-400');
    el.btnToggleKeyboard.classList.toggle('text-cyan-300');
  });

  el.virtualKeyboardInput.addEventListener('keydown', (e) => {
    const specialKeys = ['Enter', 'Backspace', 'Escape', 'Tab', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (specialKeys.includes(e.key)) {
      e.preventDefault();
      sendInput({ type: 'key_press', key: e.key });
    }
  });

  el.virtualKeyboardInput.addEventListener('input', (e) => {
    const val = e.data || el.virtualKeyboardInput.value;
    if (val) {
      sendInput({ type: 'key_press', key: val });
    }
    el.virtualKeyboardInput.value = '';
  });

  el.quickKeyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      sendInput({ type: 'key_press', key });
    });
  });

  // -------------------------------------------------------------------------
  // Cross-Browser iOS Safari & Desktop Fullscreen Handler
  // -------------------------------------------------------------------------
  function toggleFullscreen(videoElement, containerElement) {
    try {
      if (videoElement && videoElement.webkitEnterFullscreen) {
        // Native iOS Safari fullscreen for video element
        videoElement.webkitEnterFullscreen();
        return;
      }

      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(console.error);
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        if (containerElement) containerElement.classList.remove('fullscreen-mode');
      } else {
        if (containerElement && containerElement.requestFullscreen) {
          containerElement.requestFullscreen().catch((err) => {
            console.warn("requestFullscreen error, falling back to CSS fullscreen:", err);
            containerElement.classList.toggle('fullscreen-mode');
          });
        } else if (containerElement && containerElement.webkitRequestFullscreen) {
          containerElement.webkitRequestFullscreen();
        } else if (containerElement) {
          containerElement.classList.toggle('fullscreen-mode');
        }
      }
    } catch (err) {
      console.error("Fullscreen toggle error:", err);
    }
  }

  el.btnToggleFullscreen.addEventListener('click', (e) => {
    e.preventDefault();
    toggleFullscreen(el.remoteVideo, el.videoContainer);
  });

  // -------------------------------------------------------------------------
  // Server Status & Hardware Encoder Query
  // -------------------------------------------------------------------------
  async function fetchServerStatus() {
    try {
      const res = await fetch(getApiUrl('/api/status'));
      if (res.ok) {
        const data = await res.json();
        if (el.encoderBadge) {
          if (data.video_encoder === 'h264_nvenc') {
            el.encoderBadge.textContent = 'NVENC (GPU)';
            el.encoderBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 font-bold uppercase tracking-wider';
          } else {
            el.encoderBadge.textContent = 'LIBX264 (CPU)';
            el.encoderBadge.className = 'text-[10px] px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-bold uppercase tracking-wider';
          }
        }
      }
    } catch (e) {
      console.warn("Could not fetch server status:", e);
    }

    if (typeof SecurityGatekeeper !== 'undefined' && SecurityGatekeeper.fetchStatus) {
      SecurityGatekeeper.fetchStatus();
    }
  }

  // -------------------------------------------------------------------------
  // Service Worker Registration for PWA Shell
  // -------------------------------------------------------------------------
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then((reg) => {
            console.log('[PWA] Service Worker registered cleanly with scope:', reg.scope);
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('[PWA] New application shell version available; refresh to activate.');
                  }
                });
              }
            });
          })
          .catch((err) => {
            console.warn('[PWA] Service Worker registration failed:', err);
          });
      });
    }
  }

  // -------------------------------------------------------------------------
  // Application Bootstrap
  // -------------------------------------------------------------------------
  window.addEventListener('DOMContentLoaded', () => {
    if (window.lucide && typeof lucide.createIcons === 'function') {
      lucide.createIcons();
    }
    initNetworkChart();

    // Mobile Keep-Awake Screen Wake Lock initialization
    requestWakeLock();

    // Multi-PC Matrix View Engine initialization
    MatrixEngine.init();

    // Security Gatekeeper initialization
    SecurityGatekeeper.init();

    const saved = getSavedHost();
    const locHost = window.location.host;
    const isCapacitorOrLocal = !locHost || locHost.startsWith('localhost') || locHost.startsWith('127.0.0.1');

    if (saved) {
      const token = getAuthToken(saved);
      if (!token) {
        AuthModal.show(saved);
      } else {
        connectWebSocket();
      }
      fetchServerStatus();
      checkAuthStatus(saved);
    } else if (locHost && (locHost.startsWith('localhost') || locHost.startsWith('127.0.0.1'))) {
      setSavedHost(locHost);
      // Auto-fetch loopback token for host PC browser
      (async () => {
        let token = getAuthToken(locHost);
        if (!token) {
          try {
            const res = await fetch(`${window.location.protocol}//${locHost}/api/auth/loopback-token`);
            if (res.ok) {
              const lbData = await res.json();
              if (lbData.token) {
                token = lbData.token;
                setAuthToken(token, locHost);
              }
            }
          } catch (_) {}
        }
        if (!token) {
          AuthModal.show(locHost);
        } else {
          connectWebSocket();
        }
        fetchServerStatus();
        checkAuthStatus(locHost);
      })();
    } else if (!isCapacitorOrLocal) {
      setSavedHost(locHost);
      const token = getAuthToken(locHost);
      if (!token) {
        AuthModal.show(locHost);
      } else {
        connectWebSocket();
      }
      fetchServerStatus();
      checkAuthStatus(locHost);
    } else {
      DiscoveryEngine.showOverlay(false);
      DiscoveryEngine.startScan(true);
    }

    registerServiceWorker();
  });

})();
