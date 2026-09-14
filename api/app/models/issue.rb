class Issue < ApplicationRecord
  enum

  belongs_to :project_id
end
