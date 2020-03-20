import * as Yup from 'yup';
import DeliveryProblem from '../models/DeliveryProblem';
import Package from '../models/Package';

class DeliveryProblemController {
  async index(req, res) {
    const deliveryproblems = await DeliveryProblem.findAll({
      attributes: ['id', 'description'],
      include: [
        {
          model: Package,
          as: 'delivery',
          attributes: ['id', 'product'],
        },
      ],
    });

    return res.json(deliveryproblems);
  }

  async show(req, res) {
    const { id } = req.params;

    const pack = await Package.findByPk(id);

    if (!pack) {
      return res.status(400).json({
        error: 'Package does not exists',
      });
    }

    const deliveryproblems = await DeliveryProblem.findAll({
      where: {
        delivery_id: id,
      },
      include: [
        {
          model: Package,
          as: 'delivery',
          attributes: ['product'],
        },
      ],
    });

    if (!deliveryproblems) {
      return res.status(400).json({
        error: 'There are no registered problems for this package',
      });
    }

    return res.json(deliveryproblems);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { id } = req.params;

    const pack = await Package.findByPk(id);

    if (!pack) {
      return res.status(400).json({ error: 'Package does not exists' });
    }

    const {
      problem_id,
      delivery_id,
      description,
    } = await DeliveryProblem.create({
      delivery_id: id,
      description: req.body.description,
    });

    return res.json({
      problem_id,
      delivery_id,
      description,
    });
  }
}

export default new DeliveryProblemController();
