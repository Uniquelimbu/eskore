// ... existing code ...

router.get('/:id', 
  validate(schemas.team.teamIdParam),
  catchAsync(async (req, res) => {
    log.info(`TEAMROUTES (GET /:id): Fetching team ${req.params.id}`);
    const { id } = req.params;

    const team = await Team.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'firstName', 'lastName', 'email'],
          through: { 
            attributes: ['role', 'joinedAt', 'status'] 
          },
          include: [
            {
              model: Player,
              as: 'Player',
              attributes: ['id', 'position', 'height', 'weight', 'preferredFoot', 'jerseyNumber', 'nationality', 'profileImageUrl']
            },
            {
              model: Manager,
              as: 'Manager',
              attributes: ['id', 'playingStyle', 'preferredFormation', 'experience', 'profileImageUrl']
            }
          ]
        }
      ]
    });

    if (!team) {
      throw new ApiError('Team not found', 404, 'RESOURCE_NOT_FOUND');
    }

    // Add userRole if user is logged in
    let userRole = null;
    if (req.user && req.user.userId) {
      const userTeam = await UserTeam.findOne({
        where: { teamId: id, userId: req.user.userId }
      });
      
      if (userTeam) {
        userRole = userTeam.role;
      }
    }

    // Return team with userRole if applicable
    const teamResponse = team.toJSON();
    if (userRole) {
      teamResponse.userRole = userRole;
    }

    return sendSafeJson(res, teamResponse);
  })
);

// ... existing code ...
