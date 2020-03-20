import * as Yup from 'yup';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Notification from '../schemas/Notification';
import NewPackageMail from '../jobs/NewPackageMail';
import Queue from '../../lib/Queue';

class PackageController {
  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .required()
        .positive(),
      deliveryman_id: Yup.number()
        .required()
        .positive(),
      product: Yup.string()
        .required()
        .min(3),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id, product } = req.body;

    const checkIsRecipient = await Recipient.findByPk(recipient_id);

    if (!checkIsRecipient) {
      return res.status(400).json({
        error: 'You can only register a package for a valid recipient',
      });
    }

    const checkIsDeliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!checkIsDeliveryman) {
      return res.status(400).json({
        error: 'You can only register a package for a valid deliveryman',
      });
    }

    const pack = await Package.create({
      recipient_id,
      deliveryman_id,
      product,
    });

    /**
     * Notify Deliveryman
     */
    await Notification.create({
      content: `Nova encomenda cadastrada: Destinatario ${checkIsRecipient.name} / Produto ${product} disponível para retirada`,
      deliveryman: deliveryman_id,
    });

    await Queue.add(NewPackageMail.key, {
      deliverymanName: checkIsDeliveryman.name,
      deliverymanEmail: checkIsDeliveryman.email,
      name: checkIsDeliveryman.name,
      recipient: checkIsRecipient.name,
      product,
    });

    return res.json(pack);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().positive(),
      deliveryman_id: Yup.number().positive(),
      product: Yup.string().min(3),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { recipient_id, deliveryman_id } = req.body;

    const pack = await Package.findByPk(req.params.id);

    if (!pack) {
      return res.status(400).json({ error: 'Package does not exists.' });
    }

    if (recipient_id) {
      const checkIsRecipient = await Recipient.findByPk(recipient_id);

      if (!checkIsRecipient) {
        return res.status(400).json({
          error: 'You can only register a package for a valid recipient',
        });
      }
    }

    if (deliveryman_id) {
      const checkIsDeliveryman = await Deliveryman.findByPk(deliveryman_id);

      if (!checkIsDeliveryman) {
        return res.status(400).json({
          error: 'You can only register a package for a valid deliveryman',
        });
      }
    }

    if (pack.start_date !== null) {
      return res.status(401).json({
        error:
          'The product is already on the delivery route or has already been delivered',
      });
    }

    const { id, product } = await pack.update(req.body);

    return res.json({
      id,
      product,
      recipient_id,
      deliveryman_id,
    });
  }

  async delete(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }

    const pack = await Package.findByPk(req.params.id);

    if (!pack) {
      return res.status(400).json({
        error: true,
        message: 'Package does not exists',
      });
    }

    await pack.destroy();

    return res.json({
      ok: `Package id ${pack.id} deleted`,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const packages = await Package.findAll({
      order: [
        ['created_at', 'desc'],
        ['id', 'asc'],
      ],
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
      ],
    });

    return res.json(packages);
  }

  async show(req, res) {
    const schema = Yup.object().shape({
      id: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.params))) {
      return res.status(400).json({
        error: 'Invalid ID',
      });
    }

    const pack = await Package.findByPk(req.params.id, {
      order: [
        ['created_at', 'desc'],
        ['id', 'asc'],
      ],
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name'],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'],
        },
      ],
    });

    if (!pack) {
      return res.status(400).json({
        error: 'Package does not exists',
      });
    }

    return res.json(pack);
  }
}

export default new PackageController();
