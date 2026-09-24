# frozen_string_literal: true

class WorkflowEngine
  TRANSITIONS = {
    to_do: %i[in_progress],
    in_progress: %i[review],
    review: %i[qa],
    qa: %i[done in_progress],
    done: []
  }.freeze

  class InvalidTransitionError < StandardError
    attr_reader :from, :to

    def initialize(from, to)
      @from = from
      @to = to
      super("Transition from #{from} to #{to} is not allowed")
    end
  end

  def initialize(transitions: TRANSITIONS)
    @transitions = transitions
  end

  def allowed?(from, to)
    from = normalize_status(from)
    to = normalize_status(to)

    from == to || @transitions.fetch(from, []).include?(to)
  end

  alias can_transition? allowed?

  def transition!(from, to)
    return to if allowed?(from, to)

    raise InvalidTransitionError.new(from, to)
  end

  private

  def normalize_status(status)
    status.to_sym
  rescue NoMethodError
    status
  end
end
