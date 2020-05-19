require 'socket'

module Agent
  EVENTS = [:line, :call, :raise, :return, :end]
  RESET = "RESET"
  HOST = "localhost"
  PORT = 8000

  def self.run
    emit RESET
    trace = TracePoint.new(*EVENTS) do |tp|
      line_number = tp.lineno.to_i - 1
      path = tp.path.include?(Dir.pwd) ? tp.path : "#{Dir.pwd}/#{tp.path}"
      emit "#{path} #{line_number}"
    end
    trace.enable
    yield
    trace.disable
  end

  def self.emit(message)
    TCPSocket.open(HOST, PORT).tap do |client|
      client.puts message
      client.close
    end
  end
end