import * as Yup from 'yup';
import { parseISO, getHours, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';

class DeliveryStartController {
  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { start_date } = req.body;
    const { deliveryman_id, package_id } = req.params;

    const startDate = parseISO(start_date);
    const startDateHour = getHours(startDate);

    if (!(startDateHour >= 8 && startDateHour < 18)) {
      return res.status(401).json({
        error: 'Withdrawals can only be made between 8 a.m. and 6 p.m.',
      });
    }

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }

    const pack = await Package.findByPk(package_id);

    if (!pack) {
      return res.status(400).json({ error: 'Package does not exists.' });
    }

    const countPackages = await Package.count({
      where: {
        deliveryman_id,
        start_date: {
          [Op.between]: [startOfDay(startDate), endOfDay(startDate)],
        },
      },
    });

    if (countPackages >= 5) {
      return res
        .status(401)
        .json({ error: 'The limit of 5 daily withdrawals was exceeded' });
    }

    const { product } = await pack.update(req.body);

    return res.json({
      package_id,
      product,
      startDate,
    });
  }
}

export default new DeliveryStartController();
