import * as Yup from 'yup';
import { Op } from 'sequelize';
import { isBefore, startOfDay, endOfDay, parseISO } from 'date-fns';
import Meetup from '../models/Meetup';
import User from '../models/User';
import File from '../models/File';

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
    const user_id = req.userId;

    if (!(await meetupSchema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fields' });
    }

    if (isBefore(date, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    const meetup = await Meetup.create({
      ...req.body,
      user_id,
    });

    return res.status(200).json(meetup);
  }

  async index(req, res) {
    const { page = 1, limit = 10, date } = req.query;
    const where = {};
    /**
     * @param date
     * If pass a date, validate the meetups between 00:00 to 23:59
     */
    if (date) {
      const searchDate = parseISO(date);

      where.date = {
        [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
      };
    }
    const meetups = await Meetup.findAll({
      where,
      order: ['date'],
      limit,
      offset: (page - 1) * limit,
      include: [
        {
          model: User,
          attributes: ['id', 'name'],
          include: {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        },
        {
          model: File,
          as: 'banner',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    return res.json(meetups);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().min(3),
      description: Yup.string(),
      location: Yup.string(),
      date: Yup.date(),
      banner_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.query.id);

    if (meetup.user_id !== user_id) {
      return res.status(401).json({
        error: 'Is only possible to edit meetup that you is organizer',
      });
    }

    if (isBefore(parseISO(req.body.date), new Date())) {
      return res.status(401).json({ error: 'Meetup date invalid' });
    }

    if (meetup.past) {
      return res.status(400).json({ error: "Can't update past meetups" });
    }

    await meetup.update(req.body);

    return res.json(meetup);
  }

  async delete(req, res) {
    const user_id = req.userId;

    const meetup = await Meetup.findByPk(req.params.id);

    if (meetup.user_id !== user_id) {
      return res.status(401).json({ error: 'Not authorized' });
    }

    if (meetup.past) {
      return res.status(401).json({ error: "Can't delete past meetups" });
    }

    await meetup.destroy();

    return res.send();
  }
}

export default new MeetupController();
