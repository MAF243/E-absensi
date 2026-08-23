import { create } from 'zustand';

const useUiStore = create((set, get) => ({
  toast: { show: false, message: '', type: 'success' },
  toastTimeout: null,
  
  showToast: (message, type = 'success') => {
    // Clear existing timeout if any
    const currentTimeout = get().toastTimeout;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    
    set({ toast: { show: true, message, type } });
    
    // Auto hide after 3 seconds
    const newTimeout = setTimeout(() => {
      set({ toast: { show: false, message: '', type: 'success' }, toastTimeout: null });
    }, 3000);
    
    set({ toastTimeout: newTimeout });
  },
  
  hideToast: () => {
    const currentTimeout = get().toastTimeout;
    if (currentTimeout) {
      clearTimeout(currentTimeout);
    }
    set({ toast: { show: false, message: '', type: 'success' }, toastTimeout: null });
  },

  confirm: { show: false, title: '', message: '', type: 'danger', confirmText: 'Ya', cancelText: 'Batal', onConfirm: null, onCancel: null },
  showConfirm: (options, onConfirmCallback = null) => {
    return new Promise((resolve) => {
      let confirmOptions = {
        show: true,
        type: 'danger',
        confirmText: 'Ya',
        cancelText: 'Batal'
      };

      if (typeof options === 'string') {
        confirmOptions.message = options;
      } else {
        confirmOptions = { ...confirmOptions, ...options };
      }

      set({
        confirm: {
          ...confirmOptions,
          onConfirm: async () => {
            set((state) => ({ confirm: { ...state.confirm, show: false } }));
            if (onConfirmCallback) await onConfirmCallback();
            resolve(true);
          },
          onCancel: () => {
            set((state) => ({ confirm: { ...state.confirm, show: false } }));
            resolve(false);
          }
        }
      });
    });
  },
}));

export default useUiStore;
