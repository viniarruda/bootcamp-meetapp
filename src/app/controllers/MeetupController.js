import * as Yup from 'yup';
import { isBefore } from 'date-fns';
import Meetup from '../models/Meetup';

class MeetupController {
  async store(req, res) {
    const meetupSchema = Yup.object().shape({
      title: Yup.string()
        .required()
        .min(3),
      description: Yup.string().required(),
      location: Yup.string().required(),
      date: Yup.date().required(),
      banner_id: Yup.number().required(),
    });

    const { date } = req.body;

    if (!(await meetupSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fields' });
    }

    if (isBefore(date, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      ...req.body,
    });

    return res.status(200).json(meetup);
  }

  async index(req, res) {
    const { page = 1, limit = 10 } = req.query;

    const meetups = await Meetup.findAll({
      order: ['date'],
      limit,
      offset: (page - 1) * limit,
    });

    return res.json(meetups);
  }
}

export default new MeetupController();
