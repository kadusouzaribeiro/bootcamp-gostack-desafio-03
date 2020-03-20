import Package from '../models/Package';
import Recipient from '../models/Recipient';

class PackageAvailableController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const packages = await Package.findAll({
      where: {
        deliveryman_id: req.params.id,
        canceled_at: null,
        end_date: null,
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
      ],
    });

    return res.json(packages);
  }
}

export default new PackageAvailableController();
