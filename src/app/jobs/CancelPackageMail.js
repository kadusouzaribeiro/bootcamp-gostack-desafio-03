import Mail from '../../lib/Mail';

class CancelPackageMail {
  get key() {
    // declarando desta maneira podemos acessar a variável ao importar a classe
    return 'CancelPackageMail';
  }

  async handle({ data }) {
    const {
      deliverymanName,
      deliverymanEmail,
      name,
      idPackage,
      recipient,
      product,
      problem,
    } = data;

    await Mail.sendMail({
      to: `${deliverymanName} <${deliverymanEmail}>`,
      subject: 'Entrega cancelada',
      template: 'cancelpackage',
      context: {
        name,
        idPackage,
        recipient,
        product,
        problem,
      },
    });
  }
}

export default new CancelPackageMail();
