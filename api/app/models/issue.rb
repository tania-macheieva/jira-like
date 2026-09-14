# frozen_string_literal: true

class Issue < ApplicationRecord
  belongs_to :project_id

  enum :status,
       {
         todo: 0,
         in_progress: 1,
         review: 2,
         qa: 3,
         done: 4
       }

  enum :type,
       {}
end
