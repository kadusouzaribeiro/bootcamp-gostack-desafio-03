import { Op } from 'sequelize';
import Package from '../models/Package';
import Recipient from '../models/Recipient';
import File from '../models/File';

class PackageDeliveredController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const packages = await Package.findAll({
      where: {
        deliveryman_id: req.params.id,
        end_date: {
          [Op.ne]: null,
        },
      },
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
      ],
    });

    return res.json(packages);
  }
}

export default new PackageDeliveredController();
