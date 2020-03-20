import DeliveryProblem from '../models/DeliveryProblem';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import Notification from '../schemas/Notification';
import CancelPackageMail from '../jobs/CancelPackageMail';
import Queue from '../../lib/Queue';

class ProblemController {
  async delete(req, res) {
    const { id } = req.params;

    const problem = await DeliveryProblem.findByPk(id);

    if (!problem) {
      return res.status(400).json({ error: 'Problem not found' });
    }

    const pack = await Package.findOne({
      where: {
        id: problem.delivery_id,
      },
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['name'],
        },
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    if (!pack) {
      return res
        .status(400)
        .json({ error: 'Package referring to this problem not found' });
    }

    pack.canceled_at = new Date();

    await pack.save();

    await Notification.create({
      content: `Entrega ${problem.delivery_id} cancelada`,
      deliveryman: pack.deliveryman.id,
    });

    await Queue.add(CancelPackageMail.key, {
      deliverymanName: pack.deliveryman.name,
      deliverymanEmail: pack.deliveryman.email,
      name: pack.deliveryman.name,
      idPackage: pack.id,
      recipient: pack.recipient.name,
      product: pack.product,
      problem: problem.description,
    });

    return res.json(pack);
  }
}

export default new ProblemController();
