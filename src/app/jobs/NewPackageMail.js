import Mail from '../../lib/Mail';

class NewPackageMail {
  get key() {
    // declarando desta maneira podemos acessar a variável ao importar a classe
    return 'NewPackageMail';
  }

  async handle({ data }) {
    const {
      deliverymanName,
      deliverymanEmail,
      name,
      recipient,
      product,
    } = data;

    console.log('A fila executou');

    await Mail.sendMail({
      to: `${deliverymanName} <${deliverymanEmail}>`,
      subject: 'Entrega cadastrada',
      template: 'newpackage',
      context: {
        name,
        recipient,
        product,
      },
    });
  }
}

export default new NewPackageMail();
