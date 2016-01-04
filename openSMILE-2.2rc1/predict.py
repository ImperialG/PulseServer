lib_svm_path = '/root/pulse/libsvm-3.20/python'
import sys
import os
import re
import tempfile
import subprocess
from subprocess import Popen
from subprocess import PIPE
sys.path.append(lib_svm_path)
from svmutil import *

model_file = '/root/pulse/libsvm-3.20/Model/libsvm.model'
svm_scale = '/root/pulse/libsvm-3.20/svm-scale'
scale_file = '/root/pulse/libsvm-3.20/libsvm0_10.scale'
config_file = '/root/pulse/openSMILE-2.2rc1/config/gemaps/GeMAPSv01a.conf'


#given an instance file runs it through the model file to get predictions and 
#returns the prediction
def makePrediction(instance_file):
  # Read data in LIBSVM format
  y, x = svm_read_problem(instance_file)
  m = svm_load_model(model_file)
  p_label, p_acc, p_val = svm_predict(y, x, m,options="-q")
  return p_label

#runs opensmile on wav_file and writes output to out_file
def openSmile(wav_file,out_file):
  FNULL = open(os.devnull, 'w')
  subprocess.call(['SMILExtract',"-C",str(config_file),"-I",str(wav_file),"-O",str(out_file)],stdout=FNULL, stderr=subprocess.STDOUT)

#removes unneccessary info from in_file and prepares data to be in readable from for libsvm
def processOpenSmile(in_file,processed_file):
    hr = 50
    line = None;
    with in_file as cur_file:
      line = edit(cur_file);
      if(line != None):
        write(processed_file,line,hr)    

#returns line if it contains audio data
def edit(file):
  pattern = r'\'unknown\'.*' #if line starts with unknown the write it to outfile
  for line in file:
    if re.search(pattern, line):
      return line[:-1];
  return None;
    
#writes line and hr to out in format supported by libsvm
def write(out,line,hr):
  pattern = re.compile("^\s+|\s*,\s*|\s+$")
  out.write(str(hr) + " ");  
  label = 1
  for word in pattern.split(line):
    if(word == '\'unknown\'' or word == '?'):
      label = label + 1;      
      continue;
    out.write(str(label)+":"+word+" ");
    label = label + 1
  out.write('\n');
  return  

#applies scaling to in_file and writes the output in out_file
def scale(in_file,out_file):
  cmd = '{0} -r "{1}" "{2}" > "{3}"'.format(svm_scale, scale_file, in_file, out_file)
  Popen(cmd, shell = True, stdout = PIPE).communicate()

if(len(sys.argv) > 2):
  tempfile1 = tempfile.NamedTemporaryFile()
  tempfile1.seek(0)
  openSmile(sys.argv[1],tempfile1.name)
  tempfile2 = tempfile.NamedTemporaryFile()
  tempfile2.seek(0)
  processOpenSmile(tempfile1,tempfile2)
  tempfile1.close()
  print tempfile2.read()
  tempfile3 = tempfile.NamedTemporaryFile()
  tempfile3.seek(0)
  scale(tempfile2.name,tempfile3.name)
  tempfile2.close()
  hr = makePrediction(tempfile3.name)[0]
  with open(sys.argv[2],'w+') as f:
    f.write(str(hr))
