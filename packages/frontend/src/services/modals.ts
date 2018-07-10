import Service from '@ember/service';
import EmberObject from '@ember/object';

interface ModalState {
  name: string;
  isActive: boolean;
}

export default class Modals extends Service {
  modals: ModalState[] = [];

  toggle(name: string) {
    const modal = this.find(name);

    modal.set('isActive', !modal.isActive);
  }

  isVisible(name: string) {
    const modal = this.find(name);

    return modal.isActive;
  }

  find(name: string) {
    const modal = this.modals.find(m => m.name === name);

    if (!modal) {
      const newModal = new EmberObject({ name, isActive: false });

      this.modals.push(newModal);

      return newModal;
    }

    return modal;
  }
}
