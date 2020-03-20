import * as Yup from 'yup';
import { parseISO, isBefore } from 'date-fns';
import Deliveryman from '../models/Deliveryman';
import Package from '../models/Package';
import File from '../models/File';

class DeliveryEndController {
  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.date().required(),
      signature_id: Yup.number()
        .required()
        .positive(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { end_date, signature_id } = req.body;
    const { deliveryman_id, package_id } = req.params;

    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }

    const pack = await Package.findByPk(package_id);

    if (!pack) {
      return res.status(400).json({ error: 'Package does not exists.' });
    }

    const signature = await File.findByPk(signature_id);

    if (!signature) {
      return res.status(400).json({ error: 'File does not exists.' });
    }

    const endDate = parseISO(end_date);

    if (isBefore(endDate, pack.start_date)) {
      return res.status(400).json({
        error:
          'The date of delivery may not be earlier than the date of withdrawal',
      });
    }

    const { product, start_date } = await pack.update(req.body);

    return res.json({
      package_id,
      product,
      start_date,
      endDate,
    });
  }
}

export default new DeliveryEndController();
